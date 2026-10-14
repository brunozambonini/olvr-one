import { test, expect, type Locator } from "@playwright/test";

async function expectVisibleVariant(configure: Locator, id: string) {
  const preview = configure.getByRole("figure", { name: "Product preview" });
  await expect(preview).toHaveAttribute("data-displayed-variant", id);
  await expect.poll(() => preview.locator("img[class*='_product']").evaluate(image => {
    const product = image as HTMLImageElement;
    return product.complete && product.naturalWidth > 0 ? product.currentSrc : "";
  })).toMatch(new RegExp("/images/" + id + "-(?:640|960|1440)\\.webp(?:\\?.*)?$"));
}

const sizes = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

for (const size of sizes) {
  test(`motion QA ${size.name}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto("/#experience");
    const experience = page.locator("#experience");
    const slider = experience.getByRole("slider", { name: /Compare World and OLVR/ });
    const overlay = experience.locator("figure [class*='_olvrScene']");
    await expect(slider).toHaveValue("50");
    expect(parseFloat(await overlay.evaluate(el => getComputedStyle(el).transitionDuration))).toBeGreaterThan(0);
    await slider.fill("0");
    await expect(slider).toHaveValue("0");
    await slider.fill("100");
    await expect(slider).toHaveValue("100");
    await experience.getByRole("button", { name: "Explore nearby" }).click();
    await expect(experience.getByRole("status")).toContainText("Rue des Tilleuls");
    await experience.getByText("Translation", { exact: true }).click();
    await expect(experience.getByRole("status")).toContainText("Choose the action");
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await experience.screenshot({ path: `reports/visual/motion/${size.name}-experience.png` });
    const configure = page.locator("#configure");
    await configure.getByText("Titanium", { exact: true }).click();
    await expect(configure.getByRole("status")).toContainText("Showing Titanium / Clear");
    await expectVisibleVariant(configure, "titanium-clear");
    await expect(configure.locator("[class*='_shine']")).toHaveCount(1);
    await page.waitForTimeout(400);
    await configure.screenshot({ path: `reports/visual/motion/${size.name}-shine.png` });
    await expect(configure.locator("[class*='_shine']")).toHaveCount(0);
    await configure.getByText("Sand", { exact: true }).click();
    await expect(configure.getByRole("status")).toContainText("Showing Sand / Clear");
    await expectVisibleVariant(configure, "sand-clear");
    await configure.screenshot({ path: `reports/visual/motion/${size.name}-config-final.png` });
    await configure.getByRole("button", { name: "Reset selection" }).click();
    await expect(configure.getByRole("status")).toContainText("Showing Obsidian / Clear");
    await expectVisibleVariant(configure, "obsidian-clear");
  });

  test(`reduced motion QA ${size.name}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#experience");
    const experience = page.locator("#experience");
    const slider = experience.getByRole("slider", { name: /Compare World and OLVR/ });
    const overlay = experience.locator("figure [class*='_olvrScene']");
    await slider.fill("0");
    await expect(slider).toHaveValue("0");
    expect(parseFloat(await overlay.evaluate(el => getComputedStyle(el).transitionDuration))).toBeLessThan(0.001);
    const configure = page.locator("#configure");
    await configure.getByText("Titanium", { exact: true }).click();
    await expect(configure.getByRole("status")).toContainText("Showing Titanium / Clear");
    await expectVisibleVariant(configure, "titanium-clear");
    await expect(configure.locator("[class*='_shine']")).toHaveCount(0);
    await expect(configure.locator("[class*='_previous']")).toHaveCount(0);
    await configure.getByText("Sand", { exact: true }).click();
    await expectVisibleVariant(configure, "sand-clear");
    await configure.getByRole("button", { name: "Reset selection" }).click();
    await expectVisibleVariant(configure, "obsidian-clear");
  });
}
