import { test, expect } from "./support";

test("three distinct scenes compare World and OLVR and keep scripted responses honest", async ({ page }) => {
  await page.route("**/service/data/EXR/D.USD.EUR.SP00.A?**", route => route.fulfill({ status: 200, contentType: "text/csv", body: "KEY,TIME_PERIOD,OBS_VALUE\nEXR.D.USD.EUR.SP00.A,2026-10-14,1.1195" }));
  await page.goto("/");
  const section = page.locator("#experience");
  await section.scrollIntoViewIfNeeded();
  const slider = section.getByRole("slider", { name: /Compare World and OLVR/ });
  await expect(slider).toHaveValue("20");
  for (const [label, id, action, answer, hud] of [
    ["Navigation", "street", "Explore nearby", "Rue des Tilleuls", "Museum of Light"],
    ["Vision", "gallery", "Explore the artwork", "Between Light and Stone", "Still Water"],
    ["Translation", "market", "Translate the chalkboard", "pommes means apples", "Today's market"],
  ]) {
    await section.getByRole("radio", { name: label, exact: true }).check();
    await expect(section.locator("figure")).toHaveAttribute("data-scenario", label.toLowerCase());
    await expect(section.locator("figure img").first()).toHaveAttribute("src", new RegExp(`/images/scene-${id}-`));
    await expect.poll(() => section.locator("figure img").first().evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(section.locator("figure")).toContainText(hud);
    await expect(slider).toHaveValue("20");
    await section.getByRole("button", { name: action }).click();
    await expect(section.getByRole("status")).toContainText(answer);
    await expect(slider).toHaveValue("20");
  }
  await expect(section).toContainText("No camera, location, live recognition or AI is used.");
  await section.getByRole("button", { name: "Reset experience" }).click();
  await expect(section.getByRole("radio", { name: "Navigation" })).toBeChecked();
  await expect(slider).toHaveValue("20");
});

test("keyboard controls both comparison extremes and scenario selection with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator("#experience");
  const slider = section.getByRole("slider", { name: /Compare World and OLVR/ });
  await slider.focus();
  await page.keyboard.press("Home");
  await expect(slider).toHaveValue("0");
  await expect(slider).toHaveAttribute("aria-valuetext", "0% World, 100% OLVR");
  await page.keyboard.press("End");
  await expect(slider).toHaveValue("100");
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveValue("99");
  await section.getByRole("radio", { name: "Translation" }).check();
  await expect(slider).toHaveValue("20");
  await expect(section.locator("figure")).not.toContainText("Pommes");
  await expect(section.locator("figure")).toContainText("Apples");
  await expect(section.locator("figure")).toContainText("€3.20");
  expect(parseFloat(await section.locator("figure [class*='_olvrScene']").evaluate(el => getComputedStyle(el).transitionDuration))).toBeLessThan(0.001);
});

test("the glasses frame follows the OLVR reveal in every scene", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const section = page.locator("#experience");
  const slider = section.getByRole("slider", { name: /Compare World and OLVR/ });
  for (const scene of ["Navigation", "Vision", "Translation"]) {
    await section.getByRole("radio", { name: scene, exact: true }).check();
    const olvr = section.locator("figure [class*='_olvrScene']");
    const frame = olvr.locator("[class*='_lensFrame']").first();
    await expect(frame).toHaveCount(1);
    await expect(olvr).toHaveAttribute("aria-hidden", "true");
    expect(await frame.evaluate(el => getComputedStyle(el).pointerEvents)).toBe("none");
    const frameImage = frame.locator("img");
    await expect.poll(() => frameImage.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect.poll(() => frameImage.evaluate(image => (image as HTMLImageElement).currentSrc)).toMatch(/lens-frame-wide\.webp$/);
    expect(await frameImage.evaluate(image => getComputedStyle(image).objectFit)).toBe("cover");
    for (const [key, value] of [["Home", "0"], ["ArrowRight", "1"], ["End", "100"]]) {
      await slider.focus();
      await page.keyboard.press(key);
      await expect(slider).toHaveValue(value);
      await expect.poll(() => olvr.evaluate(el => getComputedStyle(el).clipPath)).toBe(`inset(0px 0px 0px ${value}%)`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const desktopFrameImage = section.locator("figure [class*='_lensFrame'] img");
  await expect.poll(() => desktopFrameImage.evaluate(image => (image as HTMLImageElement).currentSrc)).toMatch(/lens-frame-wide\.webp$/);
});

test("translation shows a dated ECB reference", async ({ page }) => {
  const csv = ["KEY,TIME_PERIOD,OBS_VALUE", "EXR.D.USD.EUR.SP00.A,2026-10-14,1.1195"].join("\n");
  await page.route("**/service/data/EXR/D.USD.EUR.SP00.A?**", route => route.fulfill({ status: 200, contentType: "text/csv", body: csv }));
  await page.goto("/");
  const section = page.locator("#experience");
  await section.getByRole("radio", { name: "Translation" }).check();
  await expect(section.locator("figure")).toContainText("€1 = $1.1195");
  await expect(section.locator("figure")).toContainText("2026-10-14");
  await section.getByRole("button", { name: "Translate the chalkboard" }).click();
  await expect(section.getByRole("status")).toContainText("not a live quote");
});

test("translation remains usable when ECB is unavailable", async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "expected-network", description: "data-api.ecb.europa.eu/service/data/EXR/" });
  await page.route("**/service/data/EXR/D.USD.EUR.SP00.A?**", route => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.goto("/");
  const section = page.locator("#experience");
  await section.getByRole("radio", { name: "Translation" }).check();
  await expect(section.locator("figure")).toContainText("Rate unavailable");
  await expect(section.locator("figure")).toContainText("Today's market");
});

test("scene failure keeps the scripted example and retry restores the image", async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "expected-network", description: "/images/scene-gallery-" });
  await page.route("**/scene-gallery-*", route => route.abort());
  await page.goto("/");
  const section = page.locator("#experience");
  await section.getByRole("radio", { name: "Vision" }).check();
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("button", { name: "Retry image" })).toBeVisible();
  await section.getByRole("button", { name: "Explore the artwork" }).click();
  await expect(section.getByRole("status")).toContainText("Between Light and Stone");
  await page.unroute("**/scene-gallery-*");
  await section.getByRole("button", { name: "Retry image" }).click();
  await expect.poll(() => section.locator("figure img").first().evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(section.getByRole("button", { name: "Retry image" })).toHaveCount(0);
});

test("no JavaScript keeps the illustrative scene and explicit fallback", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4173/");
    await expect(page.locator("#experience noscript p")).toContainText("Enable JavaScript");
    await expect(page.locator("#experience figure img").first()).toBeVisible();
    await expect(page.locator("#configure noscript p")).toContainText("nine combinations");
  } finally { await context.close(); }
});
