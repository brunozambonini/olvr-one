import { test, expect } from "./support";

test("hardware points reveal honest concept notes by pointer and keyboard", async ({ page }) => {
  await page.goto("/#hardware");
  const section = page.locator("#hardware");
  const figure = section.locator("figure");
  const note = figure.locator("#hardware-detail-note");
  await expect(note).toContainText("Select a point");
  const lens = figure.getByRole("button", { name: "Explore lens rim" });
  const aperture = figure.getByRole("button", { name: "Explore camera aperture" });
  const hinge = figure.getByRole("button", { name: "Explore hinge seam" });
  await lens.click();
  await expect(lens).toHaveAttribute("aria-pressed", "true");
  await expect(note).toContainText("The beveled rim");
  await aperture.focus();
  await page.keyboard.press("Enter");
  await expect(aperture).toHaveAttribute("aria-pressed", "true");
  await expect(lens).toHaveAttribute("aria-pressed", "false");
  await expect(note).toContainText("no camera is active");
  await expect(aperture).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(hinge).toBeFocused();
  await page.keyboard.press("Space");
  await expect(note).toContainText("working hinge has not been engineered");
  await expect(hinge).toHaveAttribute("aria-pressed", "true");
  await expect(section.getByText("Conceptual hardware. Components", { exact: false })).toBeVisible();
});

for (const width of [320, 390, 1440]) {
  test(`hardware hotspots remain visible and usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#hardware");
    const figure = page.locator("#hardware figure");
    for (const name of ["Explore lens rim", "Explore camera aperture", "Explore hinge seam"]) {
      const button = figure.getByRole("button", { name });
      await expect(button).toBeInViewport();
      await button.click();
      await expect(button).toHaveAttribute("aria-pressed", "true");
      expect(await button.evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThanOrEqual(0.00001);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
