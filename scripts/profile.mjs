import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import { gzipSync } from "node:zlib";

const baseURL = process.env.PROFILE_URL ?? "http://127.0.0.1:4173";
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+\/?$/.test(baseURL)) throw new Error("Profile only supports the local static-export HTTP server.");
const exportReport = JSON.parse(await readFile("reports/export.json", "utf8"));
const imageReport = JSON.parse(await readFile(".cache/image-report.json", "utf8"));
if (exportReport.errors.length) throw new Error("Run a successful npm run smoke first.");
const artifactIndex = await readFile("out/index.html", "utf8");
if (await (await fetch(baseURL)).text() !== artifactIndex) throw new Error("HTTP response does not match out/index.html. Do not profile a development server.");
const directory = "reports/performance";
await mkdir(directory, { recursive: true });
const percentile = (values, fraction) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  if (fraction === 0.5 && sorted.length % 2 === 0) return (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
};
const scenarios = [
  { name: "mobile", viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
    cpuSlowdown: 4, downloadBitsPerSecond: 1_600_000, uploadBitsPerSecond: 750_000, latencyMs: 150 },
  { name: "desktop", viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false,
    cpuSlowdown: 1, downloadBitsPerSecond: null, uploadBitsPerSecond: null, latencyMs: 0 },
];

async function memory(browser, cdp, page) {
  const result = { browserProcesses: null, renderer: null, images: null };
  const metrics = (await cdp.send("Performance.getMetrics")).metrics;
  result.renderer = Object.fromEntries(metrics.filter(({ name }) => ["JSHeapUsedSize", "JSHeapTotalSize", "Nodes", "Documents"].includes(name)).map(({ name, value }) => [name, value]));
  // Pixel estimate is not measured process/GPU memory and excludes detached decoded buffers.
  result.images = await page.evaluate(() => {
    const images = [...document.images].filter((img) => img.complete && img.naturalWidth > 0);
    const unique = [...new Map(images.map((img) => [img.currentSrc, img])).values()];
    return { residentDomImages: images.length, uniqueSources: unique.length,
      decodedPixelEstimateBytes: unique.reduce((sum, img) => sum + img.naturalWidth * img.naturalHeight * 4, 0),
      sources: unique.map((img) => ({ src: img.currentSrc, width: img.naturalWidth, height: img.naturalHeight })) };
  });
  result.images.sources = result.images.sources.map((image) => {
    const generated = imageReport.find((asset) => asset.path === new URL(image.src).pathname);
    return { ...image, width: generated?.width ?? image.width, height: generated?.height ?? image.height,
      dimensionsSource: generated ? "encoded image metadata" : "browser intrinsic dimensions" };
  });
  result.images.decodedPixelEstimateBytes = result.images.sources.reduce((sum, image) => sum + image.width * image.height * 4, 0);
  try {
    const session = await browser.newBrowserCDPSession();
    const processes = (await session.send("SystemInfo.getProcessInfo")).processInfo;
    await session.detach();
    const ids = processes.map(({ id }) => Number(id)).filter((id) => Number.isSafeInteger(id) && id > 0);
    if (process.platform === "win32") {
      const output = execFileSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command",
        `Get-Process -Id ${ids.join(",")} -ErrorAction SilentlyContinue | Select-Object Id,WorkingSet64,PrivateMemorySize64 | ConvertTo-Json -Compress`], { encoding: "utf8", timeout: 10_000 });
      const rows = [JSON.parse(output)].flat();
      result.browserProcesses = { method: "CDP process IDs + Windows Get-Process", processCount: rows.length,
        sumWorkingSetBytes: rows.reduce((sum, row) => sum + row.WorkingSet64, 0),
        sumPrivateMemoryBytes: rows.reduce((sum, row) => sum + row.PrivateMemorySize64, 0),
        note: "Working-set sum can double-count shared pages; includes browser/GPU/utility processes. Snapshot, not peak." };
    } else if (process.platform === "linux") {
      const rows = await Promise.all(ids.map(async (id) => {
        try { return Number((await readFile(`/proc/${id}/status`, "utf8")).match(/^VmRSS:\s+(\d+)/m)?.[1] ?? 0) * 1024; }
        catch { return 0; }
      }));
      result.browserProcesses = { method: "CDP process IDs + /proc VmRSS", processCount: rows.length,
        sumWorkingSetBytes: rows.reduce((sum, value) => sum + value, 0),
        note: "RSS sum can double-count shared pages; snapshot, not peak." };
    } else result.browserProcesses = { unavailable: `Process memory not implemented on ${process.platform}.` };
  } catch (error) { result.browserProcesses = { unavailable: error.message }; }
  return result;
}

async function interaction(page, label, variant, transfers) {
  const previousRequests = new Set(transfers.keys());
  await page.evaluate(() => {
    window.__olvrProfile.frames = [];
    window.__olvrProfile.recordFrames = true;
    window.__olvrProfile.lastFrame = null;
    window.__olvrProfile.interactionStarted = performance.now();
  });
  await page.locator("#configure label").filter({ has: page.getByRole("radio", { name: label, exact: true }) }).click();
  await page.locator(`figure[data-displayed-variant="${variant}"]`).waitFor({ state: "visible", timeout: 30_000 });
  const previewReadyMs = await page.evaluate(() => performance.now() - window.__olvrProfile.interactionStarted);
  await page.waitForTimeout(700);
  const result = await page.evaluate(() => {
    window.__olvrProfile.recordFrames = false;
    return { frames: window.__olvrProfile.frames,
      events: window.__olvrProfile.events.filter((entry) => entry.startTime >= window.__olvrProfile.interactionStarted) };
  });
  return { selection: label, previewReadyMs, frameSamples: result.frames.length,
    frameMedianMs: percentile(result.frames, 0.5), frameP95Ms: percentile(result.frames, 0.95),
    eventTimingEntries: result.events, frameIntervalsMs: result.frames,
    resources: [...transfers.entries()].filter(([id]) => !previousRequests.has(id)).map(([, resource]) => resource) };
}

async function arInteraction(page, scenario, action, transfers) {
  const area = page.locator("#experience");
  await area.getByRole("radio", { name: scenario, exact: true }).check();
  await area.getByRole("radio", { name: "World", exact: true }).check();
  const previousRequests = new Set(transfers.keys());
  await page.evaluate(() => {
    Object.assign(window.__olvrProfile, { frames: [], recordFrames: true, lastFrame: null, interactionStarted: performance.now() });
  });
  await area.getByRole("button", { name: action }).click();
  await area.locator('figure[data-view="olvr"]').waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const answer = document.querySelector('#experience [role="status"]');
    return answer && !answer.textContent.includes("Preparing") && !answer.textContent.includes("Choose an action");
  });
  const responseReadyMs = await page.evaluate(() => performance.now() - window.__olvrProfile.interactionStarted);
  await page.waitForTimeout(700);
  const frames = await page.evaluate(() => { window.__olvrProfile.recordFrames = false; return window.__olvrProfile.frames; });
  return { scenario, responseReadyMs, frameIntervalsMs: frames, frameMedianMs: percentile(frames, .5), frameP95Ms: percentile(frames, .95),
    resources: [...transfers.entries()].filter(([id]) => !previousRequests.has(id)).map(([, resource]) => resource) };
}

const browser = await chromium.launch();
const report = { generatedAt: new Date().toISOString(), command: "npm run profile", baseURL,
  artifactSha256: exportReport.artifactSha256, revision: exportReport.revision,
  environment: { node: process.version, platform: process.platform, release: os.release(), arch: os.arch(),
    cpuModel: os.cpus()[0]?.model ?? "unavailable", logicalCpus: os.cpus().length,
    totalMemoryBytes: os.totalmem(), freeMemoryBytes: os.freemem(), browser: browser.version(), physicalDevice: false },
  budgets: { initialJsGzipBytes: 250 * 1024, mobileInitialTransferBytes: 1.25 * 1024 * 1024,
    heroMobileBytes: 250 * 1024, heroDesktopBytes: 450 * 1024, frameTargetMs: 16.7, frameMedianToleranceMs: 20, frameP95ToleranceMs: 33.3 },
  initialJsGzipBytes: exportReport.initialJsGzip,
  limitations: ["Laboratory emulation; no physical device or field CWV/INP measurement.",
    "rAF intervals during selection are scheduling samples, not proof of rendered 60 FPS or GPU performance.",
    "Preview-ready latency includes input automation and image fetch/decode, and is not INP.",
    "Decoded DOM pixel estimate excludes detached images, compositor copies, compression and GPU allocations.",
    "Memory is an observed snapshot of this browser, not a device-wide application peak.",
    "No canvas in this slice; first-open/GPU canvas memory is not applicable."], runs: [] };

try {
  for (const scenario of scenarios) {
    for (let run = 1; run <= 3; run += 1) {
      const context = await browser.newContext({ viewport: scenario.viewport, deviceScaleFactor: scenario.deviceScaleFactor,
        isMobile: scenario.isMobile, hasTouch: scenario.hasTouch, reducedMotion: "no-preference", serviceWorkers: "block" });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Performance.enable");
      await cdp.send("Network.clearBrowserCache");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: scenario.cpuSlowdown });
      await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: scenario.latencyMs,
        downloadThroughput: scenario.downloadBitsPerSecond === null ? -1 : scenario.downloadBitsPerSecond / 8,
        uploadThroughput: scenario.uploadBitsPerSecond === null ? -1 : scenario.uploadBitsPerSecond / 8 });
      const transfers = new Map();
      const errors = [];
      cdp.on("Network.responseReceived", ({ requestId, response, type }) => transfers.set(requestId,
        { url: response.url, type, status: response.status, fromDiskCache: response.fromDiskCache ?? false, bytes: 0 }));
      cdp.on("Network.loadingFinished", ({ requestId, encodedDataLength }) => {
        if (transfers.has(requestId)) transfers.get(requestId).bytes = encodedDataLength;
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(() => {
        const profile = window.__olvrProfile = { lcp: null, cls: 0, clsWindow: 0, clsStart: 0, clsEnd: 0,
          frames: [], events: [], recordFrames: true, lastFrame: null, interactionStarted: Infinity };
        new PerformanceObserver((list) => {
          const entry = list.getEntries().at(-1);
          profile.lcp = { startTime: entry.startTime, size: entry.size, url: entry.url, element: entry.element?.tagName };
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.hadRecentInput) continue;
            if (entry.startTime - profile.clsEnd < 1000 && entry.startTime - profile.clsStart < 5000) profile.clsWindow += entry.value;
            else { profile.clsWindow = entry.value; profile.clsStart = entry.startTime; }
            profile.clsEnd = entry.startTime;
            profile.cls = Math.max(profile.cls, profile.clsWindow);
          }
        }).observe({ type: "layout-shift", buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) if (entry.interactionId) profile.events.push({ name: entry.name,
            startTime: entry.startTime, duration: entry.duration, interactionId: entry.interactionId });
        }).observe({ type: "event", buffered: true, durationThreshold: 16 });
        const frame = (timestamp) => {
          if (profile.recordFrames && profile.lastFrame !== null) profile.frames.push(timestamp - profile.lastFrame);
          profile.lastFrame = timestamp;
          requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      });
      await page.goto(baseURL, { waitUntil: "networkidle", timeout: 90_000 });
      await page.waitForTimeout(1500);
      const cold = await page.evaluate(() => ({ lcp: window.__olvrProfile.lcp, cls: window.__olvrProfile.cls,
        userAgent: navigator.userAgent, canvasCount: document.querySelectorAll("canvas").length,
        navigation: performance.getEntriesByType("navigation")[0]?.toJSON(), frames: window.__olvrProfile.frames }));
      const initialResources = [...transfers.values()];
      const initialTransferBytes = initialResources.reduce((sum, entry) => sum + entry.bytes, 0);
      const initialScriptTransferBytes = initialResources.filter((entry) => entry.type === "Script").reduce((sum, entry) => sum + entry.bytes, 0);
      const coldMemory = await memory(browser, cdp, page);
      await page.locator("#configure").getByRole("radio", { name: "Titanium", exact: true }).scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      // Permit caching from here; the first unseen variant still requires its initial request/decode.
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: false });
      const firstInteraction = await interaction(page, "Titanium", "titanium-clear", transfers);
      const firstLensInteraction = await interaction(page, "Sun", "titanium-sun", transfers);
      await interaction(page, "Sand", "sand-sun", transfers);
      const warmedInteractions = [await interaction(page, "Titanium", "titanium-sun", transfers),
        await interaction(page, "Sand", "sand-sun", transfers)];
      await interaction(page, "Clear", "sand-clear", transfers);
      const warmedLensInteractions = [await interaction(page, "Sun", "sand-sun", transfers),
        await interaction(page, "Clear", "sand-clear", transfers)];
      const arScenarios = [["Navigation", "Find the café"], ["Vision", "Explore the scene"], ["Translation", "Translate the menu"]];
      const firstArInteractions = [];
      const warmedArInteractions = [];
      for (const [name, action] of arScenarios) firstArInteractions.push(await arInteraction(page, name, action, transfers));
      for (const [name, action] of arScenarios) warmedArInteractions.push(await arInteraction(page, name, action, transfers));
      const afterInteractionMemory = await memory(browser, cdp, page);
      if (run === 1) {
        await page.screenshot({ path: `${directory}/${scenario.name}-selection.png` });
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
        await page.screenshot({ path: `${directory}/${scenario.name}-viewport.png` });
        await page.screenshot({ path: `${directory}/${scenario.name}-full.png`, fullPage: true });
      }
      const entry = { scenario, run, initialTransferBytes, initialScriptTransferBytes, initialResources,
        lcp: cold.lcp, cls: cold.cls, userAgent: cold.userAgent, canvasCount: cold.canvasCount,
        navigation: cold.navigation, coldFrames: { samples: cold.frames.length,
          medianMs: percentile(cold.frames, 0.5), p95Ms: percentile(cold.frames, 0.95) },
        firstInteraction, firstLensInteraction, warmedInteractions, warmedLensInteractions, firstArInteractions, warmedArInteractions, coldMemory, afterInteractionMemory, errors };
      report.runs.push(entry);
      await writeFile(`${directory}/profile.json`, `${JSON.stringify(report, null, 2)}\n`);
      console.log(`${scenario.name} ${run}/3: LCP ${cold.lcp?.startTime.toFixed(0)}ms, CLS ${cold.cls.toFixed(4)}, initial ${(initialTransferBytes / 1024).toFixed(0)}KiB, first preview ${firstInteraction.previewReadyMs.toFixed(0)}ms.`);
      await context.close();
    }
  }
  report.summary = scenarios.map(({ name }) => {
    const runs = report.runs.filter((run) => run.scenario.name === name);
    return { scenario: name, coldLcpMedianMs: percentile(runs.map((run) => run.lcp?.startTime ?? Infinity), 0.5),
      maxCls: Math.max(...runs.map((run) => run.cls)),
      maxInitialTransferBytes: Math.max(...runs.map((run) => run.initialTransferBytes)),
      maxInitialScriptTransferBytes: Math.max(...runs.map((run) => run.initialScriptTransferBytes)),
      firstPreviewMedianMs: percentile(runs.map((run) => run.firstInteraction.previewReadyMs), 0.5),
      firstLensPreviewMedianMs: percentile(runs.map((run) => run.firstLensInteraction.previewReadyMs), 0.5),
      warmedPreviewMedianMs: percentile(runs.flatMap((run) => run.warmedInteractions.map((entry) => entry.previewReadyMs)), 0.5),
      warmedLensPreviewMedianMs: percentile(runs.flatMap((run) => run.warmedLensInteractions.map((entry) => entry.previewReadyMs)), 0.5),
      ar: ["Navigation", "Vision", "Translation"].map(scenario => ({ scenario,
        firstResponseMedianMs: percentile(runs.flatMap(run => run.firstArInteractions.filter(entry => entry.scenario === scenario).map(entry => entry.responseReadyMs)), .5),
        warmedResponseMedianMs: percentile(runs.flatMap(run => run.warmedArInteractions.filter(entry => entry.scenario === scenario).map(entry => entry.responseReadyMs)), .5) })) };
  });
  const scripts = new Set([...artifactIndex.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]));
  for (const run of report.runs) for (const resource of run.initialResources) {
    if (resource.type === "Script" && new URL(resource.url).origin === new URL(baseURL).origin) scripts.add(new URL(resource.url).pathname);
  }
  report.initialScriptUnion = await Promise.all([...scripts].map(async path => {
    if (!/^\/_next\/static\/[a-zA-Z0-9_./-]+\.js$/.test(path) || path.includes("..")) throw new Error(`Unexpected script path: ${path}`);
    return { path, gzipBytes: gzipSync(await readFile(`out${path}`)).length };
  }));
  report.initialScriptUnionGzipBytes = report.initialScriptUnion.reduce((total, script) => total + script.gzipBytes, 0);
  await writeFile(`${directory}/profile.json`, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report.summary, null, 2));
} finally { await browser.close(); }
