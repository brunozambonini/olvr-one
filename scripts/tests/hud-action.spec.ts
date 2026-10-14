import { test, expect } from "./support";

for (const width of [1440, 390, 320]) {
  test(`comparison divider works with pointer and keyboard at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.goto("/");
    const section = page.locator("#experience");
    await section.scrollIntoViewIfNeeded();
    const slider = section.getByRole("slider", { name: /Compare World and OLVR/ });
    if (testInfo.project.name === "chromium") {
      await section.getByRole("radio", { name: "Translation" }).check();
      await section.locator("figure").screenshot({ path: `reports/visual/compare-translation-${width}.png` });
    }
    const box = await slider.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * .75, box!.y + box!.height / 2, { steps: 6 });
    await page.mouse.up();
    expect(Number(await slider.inputValue())).toBeGreaterThan(60);
    await slider.focus();
    await page.keyboard.press("Home");
    await expect(slider).toHaveValue("0");
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("100");
    const grip = section.locator("figure [class*='_grip']");
    const gripBox = await grip.boundingBox();
    expect(gripBox!.width).toBeGreaterThanOrEqual(44);
    expect(gripBox!.height).toBeGreaterThanOrEqual(44);
    if (testInfo.project.name === "chromium") await section.locator("figure").screenshot({ path: `reports/visual/compare-${width}.png` });
  });
}

test("touch input changes the comparison on mobile", async ({ browser, browserName }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4173/");
    const section = page.locator("#experience");
    await section.scrollIntoViewIfNeeded();
    const slider = section.getByRole("slider", { name: /Compare World and OLVR/ });
    const box = await slider.boundingBox();
    await page.touchscreen.tap(box!.x + box!.width * .8, box!.y + box!.height / 2);
    expect(Number(await slider.inputValue()), `${browserName} touch comparison`).toBeGreaterThan(60);
  } finally { await context.close(); }
});
