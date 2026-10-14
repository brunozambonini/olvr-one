import { selectVariant, test, expect, openConfigurator, expectVariant } from "./support";

for (const viewport of [{ width: 320, height: 568 }, { width: 360, height: 640 }]) {
  test(`preview and all options fit together at ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await openConfigurator(page);
    await page.locator("#configure").evaluate(section => section.scrollIntoView({ block: "start", behavior: "instant" }));
    const geometry = await page.evaluate(() => {
      const rect = (selector: string) => {
        const box = document.querySelector(selector)!.getBoundingClientRect();
        return { top: box.top, bottom: box.bottom, height: box.height, left: box.left, right: box.right };
      };
      return { viewport: { width: innerWidth, height: innerHeight }, scrollWidth: document.documentElement.scrollWidth, preview: rect("#configure figure"), options: (() => { const fields = [...document.querySelectorAll("#configure fieldset")]; const first = fields[0].getBoundingClientRect(); const last = fields.at(-1)!.getBoundingClientRect(); return {top:first.top,bottom:last.bottom}; })(), controls: [...document.querySelectorAll("#configure fieldset label")].map(label => ({ width: label.getBoundingClientRect().width, height: label.getBoundingClientRect().height })) };
    });
    await testInfo.attach("low-height-geometry", { body: JSON.stringify(geometry, null, 2), contentType: "application/json" });
    await testInfo.attach("low-height-configurator", { body: await page.screenshot(), contentType: "image/png" });
    expect(geometry.scrollWidth).toBeLessThanOrEqual(viewport.width);
    expect(geometry.options.top - geometry.preview.bottom).toBeLessThanOrEqual(40);
    expect(geometry.options.bottom - geometry.preview.top).toBeLessThan(viewport.height - 48);
    expect(geometry.preview.top).toBeGreaterThanOrEqual(0);
    expect(geometry.options.bottom).toBeLessThanOrEqual(viewport.height);
    for (const control of geometry.controls) {
      expect(control.height).toBeGreaterThanOrEqual(44);
      expect(control.width).toBeGreaterThanOrEqual(44);
    }
    await selectVariant(page, "Sand / Adaptive");
    await expectVariant(page, "Sand / Adaptive", "sand-adaptive");
  });
}

test("200 percent equivalent reflow keeps navigation and choices usable", async ({ browser }, testInfo) => {
  testInfo.annotations.push({ type: "limitation", description: "Reflow simulation: 1440x900 at 200% represented by viewport720x450/DPR2; not native browser UI zoom." });
  const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 2, baseURL: "http://127.0.0.1:4173" });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  try {
    await openConfigurator(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const label of ["Titanium / Sun", "Sand / Adaptive", "Obsidian / Sun"]) {
      await selectVariant(page, label);
      await expect(page.locator("#configure").getByRole("status")).toHaveText(`Showing ${label}.`);
    }
    await page.getByRole("button", { name: "Reset selection", exact: true }).click();
    await expectVariant(page, "Obsidian / Clear", "obsidian-clear");
    await testInfo.attach("200-percent-reflow-simulation", { body: await page.screenshot(), contentType: "image/png" });
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});
