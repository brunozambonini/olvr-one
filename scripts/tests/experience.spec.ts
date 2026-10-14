import { test, expect } from "./support";

test("scripted scenarios switch world and OLVR and translate contextual menu", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#experience");
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator("figure")).toHaveAttribute("data-view", "world");
  for (const [scenario, action, answer] of [["Navigation", "Find the café", "just ahead"], ["Vision", "Explore the scene", "outdoor seating"], ["Translation", "Translate the menu", "French to English"]]) {
    await section.getByRole("radio", { name: scenario, exact: true }).check();
    await section.getByRole("radio", { name: "OLVR", exact: true }).check();
    if (scenario === "Translation") await expect(section.locator("dl dt").first()).toHaveText("Café");
    await section.getByRole("button", { name: action }).click();
    await expect(section.getByRole("status")).toContainText(answer);
    await expect(section.locator("figure")).toHaveAttribute("data-view", "olvr");
  }
  await expect(section.locator("dl dt")).toHaveText(["Coffee", "Tea", "Croissant"]);
  await expect(section.getByText("Scripted concept demo.", { exact: false })).toBeVisible();
  await section.getByRole("button", { name: "Reset experience" }).click();
  await expect(section.getByRole("radio", { name: "Navigation", exact: true })).toBeChecked();
  await expect(section.locator("figure")).toHaveAttribute("data-view", "world");
});

test("AR keyboard focus and reduced motion preserve translation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator("#experience");
  await section.locator("h2").focus(); await page.keyboard.press("Tab");
  for (const name of ["Navigation", "Vision", "Translation"]) {
    const radio = section.getByRole("radio", { name, exact: true });
    await expect(radio).toBeFocused();
    expect(await radio.evaluate(input => getComputedStyle(input.nextElementSibling!).outlineStyle)).toBe("solid");
    if (name !== "Translation") await page.keyboard.press("ArrowDown");
  }
  await page.keyboard.press("Tab");
  await expect(section.getByRole("radio", { name: "World", exact: true })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(section.getByRole("radio", { name: "OLVR", exact: true })).toBeFocused();
  const menu = section.locator('figure div[aria-hidden="true"]');
  await expect(menu).toContainText("Français");
  await expect(menu).toContainText("Café");
  await expect(menu).toContainText("Thé");
  expect(await menu.evaluate(el => getComputedStyle(el).animationName)).toBe("none");
  await section.getByRole("button", { name: "Translate the menu" }).click();
  await expect(menu).toContainText("English");
  await expect(menu).toContainText("Coffee");
  await expect(menu).toContainText("Tea");
});

test("pending AR responses are cancelled by mode view and reset", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#experience");
  await section.scrollIntoViewIfNeeded();
  await page.clock.install();
  for (const cancel of ["Vision", "World", "Reset experience"]) {
    await section.getByRole("button", { name: "Reset experience" }).click();
    await section.getByRole("button", { name: "Find the café" }).click();
    await expect(section.getByRole("status")).toHaveText("Preparing a scripted response…");
    if (cancel === "Reset experience") await section.getByRole("button", { name: cancel }).click();
    else await section.getByRole("radio", { name: cancel, exact: true }).check();
    await page.clock.fastForward(300);
    await expect(section.getByRole("status")).toHaveText("Choose an action to reveal a little more about this scene.");
  }
});

test("scene failure leaves scenarios usable and retry restores picture", async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "expected-network", description: "/images/scene-street-" });
  await page.route("**/scene-street-*", route => route.abort());
  await page.goto("/");
  const section = page.locator("#experience");
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("button", { name: "Retry scene" })).toBeVisible();
  await section.getByRole("radio", { name: "Translation", exact: true }).check();
  await section.getByRole("button", { name: "Translate the menu" }).click();
  await expect(section.locator("dl dt").first()).toHaveText("Coffee");
  await page.unroute("**/scene-street-*");
  await section.getByRole("button", { name: "Retry scene" }).click();
  await expect.poll(() => section.locator("img").evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(section.getByRole("button", { name: "Retry scene" })).toHaveCount(0);
});

test("no JavaScript preserves narrative pictures and explicit fallback", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage(); await page.goto("http://127.0.0.1:4173/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect.poll(() => page.locator("#experience noscript").evaluate(el => el.textContent)).toContain("Enable JavaScript");
    await expect(page.locator("#experience noscript p")).toBeVisible();
    await expect.poll(() => page.locator("#configure noscript").evaluate(el => el.textContent)).toContain("nine combinations");
    await expect(page.locator("#configure noscript p")).toBeVisible();
    await expect(page.locator("#hardware")).toBeVisible();
    await expect(page.locator("#configure figure")).toHaveAttribute("data-displayed-variant", "obsidian-clear");
  } finally { await context.close(); }
});
