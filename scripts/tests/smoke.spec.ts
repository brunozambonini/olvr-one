import { openConfigurator, selectVariant, expect, test } from "./support";

for (const width of [320, 390, 768, 1440]) {
  test(`export loads without overflow at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: width < 768 ? 844 : 960 });
    await page.goto("/");
    await expect(page).toHaveTitle(/OLVR ONE/);
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("missing routes serve the exported 404", async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "expected-network", description: "/this-route-does-not-exist/" });
  const response = await page.goto("/this-route-does-not-exist/");
  expect(response?.status()).toBe(404);
});

test("reduced motion keeps content and selection usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await selectVariant(page, "Titanium / Sun");
  await expect(page.locator('figure[data-displayed-variant="titanium-sun"]')).toBeVisible();
  await page.getByRole("button", { name: "Reset selection", exact: true }).click();
  await expect(page.locator('figure[data-displayed-variant="obsidian-clear"]')).toBeVisible();
});

test("latest requested variant wins when an earlier image is slow", async ({ page }) => {
  await page.route("**/titanium-sun-*.webp", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.goto("/");
  await selectVariant(page, "Titanium / Sun");
  await selectVariant(page, "Sand / Adaptive");
  await expect(page.locator('figure[data-displayed-variant="sand-adaptive"]')).toBeVisible();
  await page.waitForLoadState("networkidle");
  await expect(page.locator('figure[data-displayed-variant="sand-adaptive"]')).toBeVisible();
});

test("failed image preserves previous preview and retries the requested selection", async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "expected-network", description: "/images/sand-adaptive-" });
  await page.route("**/sand-adaptive-*.webp", (route) => route.abort());
  await openConfigurator(page);
  await selectVariant(page, "Sand / Adaptive");
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible();
  await expect(page.locator('figure[data-displayed-variant="obsidian-clear"]')).toBeVisible();
  await page.unroute("**/sand-adaptive-*.webp");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator('figure[data-displayed-variant="sand-adaptive"]')).toBeVisible();
});
