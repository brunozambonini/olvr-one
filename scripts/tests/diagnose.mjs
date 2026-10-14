import { chromium, firefox, webkit } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { expect } from "@playwright/test";

const directory = process.argv[2] ?? "reports/validation-diagnostics";
const report = { artifact: JSON.parse(await readFile("reports/export.json", "utf8")), browsers: [] };
await mkdir(directory, { recursive: true });
for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const events = [];
  page.on("requestfailed", request => events.push({ url: request.url(), failure: request.failure() }));
  const imageState = () => page.evaluate(() => {
    const image = document.querySelector("#configure figure img");
    return { src: image.currentSrc, srcAttr: image.getAttribute("src"), srcset: image.srcset, complete: image.complete, naturalWidth: image.naturalWidth, status: document.querySelector('[role="status"]').textContent, retry: [...document.querySelectorAll("button")].some(button => button.textContent.includes("Try again")) };
  });
  await page.route("**/obsidian-clear-*.webp", route => route.abort());
  await page.goto("http://127.0.0.1:4173/");
  await page.locator("#configure").scrollIntoViewIfNeeded();
  await page.waitForLoadState("networkidle");
  const failed = await imageState();
  await page.screenshot({ path: `${directory}/${name}-initial-failure.png` });
  await page.unroute("**/obsidian-clear-*.webp");
  let retried;
  if (failed.retry) {
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(page.getByRole("status")).not.toContainText("Loading");
    await expect.poll(() => page.locator("#configure figure img").first().evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    retried = await imageState();
    await page.screenshot({ path: `${directory}/${name}-initial-retry.png` });
  }
  const keyboard = [];
  await page.goto("about:blank");
  await page.setContent('<a href="#destination">A link</a><button>A button</button><input type="radio" name="r"><input type="radio" name="r"><main id="destination" tabindex="-1">Destination</main>');
  for (const key of ["Tab", "Tab", "Tab", "Alt+Tab", "Alt+Tab"]) {
    await page.keyboard.press(key);
    keyboard.push({ key, state: await page.evaluate(() => ({ tag: document.activeElement.tagName, text: document.activeElement.textContent, focusVisible: document.activeElement.matches(":focus-visible") })) });
  }
  report.browsers.push({ name, version: browser.version(), failed, retried, events, keyboard });
  await browser.close();
}
await writeFile(`${directory}/results.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
