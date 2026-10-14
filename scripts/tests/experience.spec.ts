import { test, expect } from "./support";

test("three distinct scenes compare World and OLVR and keep scripted responses honest", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#experience");
  await section.scrollIntoViewIfNeeded();
  const slider = section.getByRole("slider", { name: /Compare World and OLVR/ });
  await expect(slider).toHaveValue("50");
  for (const [label, id, action, answer] of [
    ["Navigation", "street", "Find the café", "scripted example"],
    ["Vision", "gallery", "Explore the gallery", "gallery scene"],
    ["Translation", "market", "Translate the signs", "pommes means apples"],
  ]) {
    await section.getByRole("radio", { name: label, exact: true }).check();
    await expect(section.locator("figure")).toHaveAttribute("data-scenario", label.toLowerCase());
    await expect(section.locator("figure img").first()).toHaveAttribute("src", new RegExp(`/images/scene-${id}-`));
    await expect.poll(() => section.locator("figure img").first().evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(slider).toHaveValue("50");
    await section.getByRole("button", { name: action }).click();
    await expect(section.getByRole("status")).toContainText(answer);
    await expect(slider).toHaveValue("20");
  }
  await expect(section).toContainText("No camera, location, live recognition or AI is used.");
  await section.getByRole("button", { name: "Reset experience" }).click();
  await expect(section.getByRole("radio", { name: "Navigation" })).toBeChecked();
  await expect(slider).toHaveValue("50");
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
  await expect(slider).toHaveValue("50");
  await expect(section.locator("figure")).toContainText("Pommes");
  expect(parseFloat(await section.locator("figure [class*='_olvrScene']").evaluate(el => getComputedStyle(el).transitionDuration))).toBeLessThan(0.001);
});

test("scene failure keeps the scripted example and retry restores the image", async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "expected-network", description: "/images/scene-gallery-" });
  await page.route("**/scene-gallery-*", route => route.abort());
  await page.goto("/");
  const section = page.locator("#experience");
  await section.getByRole("radio", { name: "Vision" }).check();
  await section.scrollIntoViewIfNeeded();
  await expect(section.getByRole("button", { name: "Retry image" })).toBeVisible();
  await section.getByRole("button", { name: "Explore the gallery" }).click();
  await expect(section.getByRole("status")).toContainText("gallery scene");
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
