import { selectVariant, test, expect, openConfigurator, expectVariant, deferred } from "./support";

test("nine real combinations keep image, caption, selection and simulation disclosure consistent", async ({ page }) => {
  await openConfigurator(page);
  await expect(page.locator("#configure").getByRole("radio")).toHaveCount(6);
  const variants = ["Obsidian", "Titanium", "Sand"].flatMap(frame => ["Clear", "Sun", "Adaptive"].map(lens => [`${frame} / ${lens}`, `${frame}-${lens}`.toLowerCase()]));
  for (const [label, id] of variants) {
    await selectVariant(page, label);
    await expectVariant(page, label, id);
    await expect(page.getByRole("figure", { name: "Product preview" }).locator("img").first()).toHaveAttribute("alt", /OLVR ONE concept glasses/);
  }
  await expect(page.getByText("Adaptive is a fixed simulated appearance.", { exact: true })).toBeVisible();
  await expect(page.getByText("Not available for purchase.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Reset selection", exact: true }).click();
  await expectVariant(page, "Obsidian / Clear", "obsidian-clear");
});

test("native radio keyboard navigation reaches both groups with visible focus", async ({ page }) => {
 await openConfigurator(page);
 await page.locator("#configure-title").focus(); await page.keyboard.press("Tab");
 for (const name of ["Obsidian", "Titanium", "Sand"]) {
 const radio=page.locator("#configure").getByRole("radio", {name, exact:true});
 await expect(radio).toBeFocused(); expect(await radio.evaluate(input=>getComputedStyle(input.closest("label")!).outlineStyle)).toBe("solid");
 if(name!=="Sand") await page.keyboard.press("ArrowDown");
 }
 await page.keyboard.press("Tab");
 for (const name of ["Clear", "Sun", "Adaptive"]) {
 const radio=page.locator("#configure").getByRole("radio", {name, exact:true});
 await expect(radio).toBeFocused(); expect(await radio.evaluate(input=>getComputedStyle(input.closest("label")!).outlineStyle)).toBe("solid");
 if(name!=="Adaptive") await page.keyboard.press("ArrowDown");
 }
 await expectVariant(page,"Sand / Adaptive","sand-adaptive");
 await page.keyboard.press("Tab"); await expect(page.getByRole("button",{name:"Reset selection",exact:true})).toBeFocused();
});

test("mobile menu closes on Escape and navigation moves focus to its destination", async ({ page, browserName }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  await expect(navigation).not.toBeVisible();
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Close menu", exact: true })).toHaveAttribute("aria-expanded", "true");
  if (browserName === "webkit") {
    testInfo.annotations.push({ type: "limitation", description: "This Windows WebKit port skips native links in Tab order, reproduced on a minimal HTML page; link activation uses focus and Enter." });
    await navigation.getByRole("link", { name: "Design", exact: true }).focus();
  } else {
    await page.keyboard.press("Tab");
  }
  await expect(navigation.getByRole("link", { name: "Design", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(navigation).not.toBeVisible();
  await expect(menu).toBeFocused();
  await menu.click();
  await navigation.getByRole("link", { name: "Make it yours", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#configure$/);
  await expect(page.locator("#configure-title")).toBeFocused();
  await expect(navigation).not.toBeVisible();
  await page.getByRole("link", { name: "OLVR ONE, back to top" }).click();
  await expect(page).toHaveURL(/#top$/);
  await menu.click();
  await page.getByRole("img", { name: /OLVR ONE concept glasses: sculpted graphite/ }).click();
  await expect(navigation).not.toBeVisible();
});

test("skip link is outside the viewport until keyboard focus and reaches main", async ({ page, browserName }, testInfo) => {
  await page.goto("/");
  const skip = page.getByRole("link", { name: "Skip to content" });
  expect(await skip.evaluate(link => link.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  if (browserName === "webkit") {
    testInfo.annotations.push({ type: "limitation", description: "This Windows WebKit port skips native links in Tab order; skip-link visibility and Enter destination tested after programmatic focus." });
    await skip.focus();
  } else {
    await page.keyboard.press("Tab");
  }
  await expect(skip).toBeFocused();
  expect(await skip.evaluate(link => link.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  expect(await skip.evaluate(link => link.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
});

test("loading preserves and identifies the decoded old preview until the new image succeeds", async ({ page }) => {
  const requested = deferred();
  const release = deferred();
  await page.route("**/titanium-sun-*.webp", async route => { requested.resolve(); await release.promise; await route.continue(); });
  try {
    await openConfigurator(page);
    await selectVariant(page, "Titanium / Sun");
    await requested.promise;
    await expect(page.locator("#configure").getByRole("radio", { name: "Titanium", exact: true })).toBeChecked();
    await expect(page.getByRole("figure", { name: "Product preview" })).toHaveAttribute("aria-busy", "true");
    await expect(page.locator("#configure").getByRole("status")).toHaveText("Loading Titanium / Sun. Still showing Obsidian / Clear.");
    await expect(page.locator("#configure figcaption")).toContainText("Obsidian / Clear");
    await expect(page.locator('#configure img').first()).toHaveAttribute("alt", /matte graphite frame and transparent lenses/);
    release.resolve();
    await expectVariant(page, "Titanium / Sun", "titanium-sun");
  } finally { release.resolve(); }
});

test("a late decoded image cannot replace the last requested variant or a pending reset", async ({ page }) => {
  const requested = deferred();
  const release = deferred();
  const finished = deferred();
  await page.route("**/titanium-sun-*.webp", async route => { requested.resolve(); await release.promise; await route.continue(); finished.resolve(); });
  try {
    await openConfigurator(page);
    await selectVariant(page, "Titanium / Sun");
    await requested.promise;
    await selectVariant(page, "Sand / Adaptive");
    await expectVariant(page, "Sand / Adaptive", "sand-adaptive");
    await page.getByRole("button", { name: "Reset selection", exact: true }).click();
    await expectVariant(page, "Obsidian / Clear", "obsidian-clear");
    release.resolve();
    await finished.promise;
    await page.waitForLoadState("networkidle");
    await expectVariant(page, "Obsidian / Clear", "obsidian-clear");
  } finally { release.resolve(); }
});

test("reset while the first alternate preview is pending invalidates it", async ({ page }) => {
  const requested = deferred();
  const release = deferred();
  await page.route("**/titanium-sun-*.webp", async route => { requested.resolve(); await release.promise; await route.continue(); });
  try {
    await openConfigurator(page);
    await selectVariant(page, "Titanium / Sun");
    await requested.promise;
    await page.getByRole("button", { name: "Reset selection", exact: true }).click();
    await expectVariant(page, "Obsidian / Clear", "obsidian-clear");
    release.resolve();
    await page.waitForLoadState("networkidle");
    await expectVariant(page, "Obsidian / Clear", "obsidian-clear");
  } finally { release.resolve(); }
});

test("reset clears a failed selection without relabeling the old picture", async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "expected-network", description: "/images/sand-adaptive-" });
  await page.route("**/sand-adaptive-*.webp", route => route.abort());
  await openConfigurator(page);
  await selectVariant(page, "Sand / Adaptive");
  await expect(page.locator("#configure").getByRole("status")).toHaveText("Could not load Sand / Adaptive. Still showing Obsidian / Clear.");
  await expect(page.locator("#configure").getByRole("radio", { name: "Adaptive", exact: true })).toBeChecked();
  await expect(page.locator("#configure figcaption")).toContainText("Obsidian / Clear");
  await page.getByRole("button", { name: "Reset selection", exact: true }).click();
  await expectVariant(page, "Obsidian / Clear", "obsidian-clear");
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toHaveCount(0);
});

test("initial image failure exposes an honest empty state and can retry", async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "expected-network", description: "/images/obsidian-clear-" });
  await page.route("**/obsidian-clear-*.webp", route => route.abort());
  await page.goto("/");
  await page.locator("#configure").scrollIntoViewIfNeeded();
  await expect(page.locator("#configure").getByRole("status")).toHaveText("Could not load Obsidian / Clear. Preview unavailable.");
  const figure = page.getByRole("figure", { name: "Product preview" });
  await expect(figure).not.toHaveAttribute("data-displayed-variant");
  await expect(figure.locator("figcaption")).toContainText("Preview unavailable");
  await expect(figure.locator("img").first()).toBeHidden();
  await expect(page.locator("#configure").getByRole("radio")).toHaveCount(6);
  await page.unroute("**/obsidian-clear-*.webp");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expectVariant(page, "Obsidian / Clear", "obsidian-clear");
});

test("initial image failure can recover via another combination and reset", async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "expected-network", description: "/images/obsidian-clear-" });
  await page.route("**/obsidian-clear-*.webp", route => route.abort());
  await page.goto("/");
  await page.locator("#configure").scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible();
  await selectVariant(page, "Titanium / Sun");
  await expectVariant(page, "Titanium / Sun", "titanium-sun");
  await page.unroute("**/obsidian-clear-*.webp");
  await page.getByRole("button", { name: "Reset selection", exact: true }).click();
  await expectVariant(page, "Obsidian / Clear", "obsidian-clear");
});

test("an initial image error before hydration is reconciled after scripts arrive", async ({ page }, testInfo) => {
  testInfo.annotations.push({ type: "expected-network", description: "/images/obsidian-clear-" });
  const releaseScripts = deferred();
  await page.route("**/_next/static/**/*.js", async route => { await releaseScripts.promise; await route.continue(); });
  await page.route("**/obsidian-clear-*.webp", route => route.abort());
  try {
    await page.goto("/", { waitUntil: "commit" });
    await page.locator("#configure").scrollIntoViewIfNeeded();
    await expect.poll(() => page.locator("#configure figure img").first().evaluate(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth === 0)).toBe(true);
    releaseScripts.resolve();
    await expect(page.locator("#configure").getByRole("status")).toHaveText("Could not load Obsidian / Clear. Preview unavailable.");
    await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible();
    await page.unroute("**/obsidian-clear-*.webp");
    await page.getByRole("button", { name: "Try again", exact: true }).click();
    await expectVariant(page, "Obsidian / Clear", "obsidian-clear");
  } finally { releaseScripts.resolve(); }
});

test("reduced motion suppresses transitions and moving loading feedback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openConfigurator(page);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  const release = deferred();
  const requested = deferred();
  await page.route("**/titanium-sun-*.webp", async route => { requested.resolve(); await release.promise; await route.continue(); });
  try {
    await selectVariant(page, "Titanium / Sun");
    await requested.promise;
    expect(await page.locator("#configure").getByRole("status").locator("span").evaluate(span => getComputedStyle(span).animationName)).toBe("none");
    release.resolve();
    await expectVariant(page, "Titanium / Sun", "titanium-sun");
    await expect(page.locator('#configure img[aria-hidden="true"]')).toHaveCount(0);
  } finally { release.resolve(); }
});
