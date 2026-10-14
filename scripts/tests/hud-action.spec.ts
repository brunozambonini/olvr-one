import { test, expect } from "./support";

for (const width of [1440, 390, 320]) {
  test(`HUD action works by pointer and keyboard at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const section = page.locator("#experience");
    const figure = section.locator("figure");
    await section.scrollIntoViewIfNeeded();
    await expect(figure.getByRole("button")).toHaveCount(0);
    await page.clock.pauseAt(new Date());
    for (const [scenario, answer] of [["Navigation", "just ahead"], ["Vision", "outdoor seating"], ["Translation", "French to English"]]) {
      await section.getByRole("radio", { name: scenario, exact: true }).check({ force: true });
      await section.getByRole("radio", { name: "OLVR", exact: true }).check({ force: true });
      const action = figure.getByRole("button", { name: `Request ${scenario.toLowerCase()} context`, exact: true });
      await expect(action).toBeVisible();
      const box = await action.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
      if (scenario === "Translation") {
        const menu = await figure.locator('div[aria-hidden="true"] > div').first().boundingBox();
        expect(box!.x >= menu!.x + menu!.width || box!.x + box!.width <= menu!.x || box!.y >= menu!.y + menu!.height || box!.y + box!.height <= menu!.y).toBeTruthy();
      }
      await action.click();
      await expect(action).toHaveAttribute("aria-disabled", "true");
      await expect(action).not.toHaveAttribute("disabled", "");
      await expect(section.getByRole("button", { name: "Preparing context" })).toBeDisabled();
      await page.clock.fastForward(250);
      await expect(section.getByRole("status")).toContainText(answer);
      await expect(action).toBeEnabled();
      await section.getByRole("radio", { name: "OLVR", exact: true }).focus();
      await page.keyboard.press("Tab");
      await expect(action).toBeFocused();
      expect(await action.evaluate(el => getComputedStyle(el).outlineStyle)).toBe("solid");
      await page.keyboard.press("Enter");
      await expect(action).toHaveAttribute("aria-disabled", "true");
      await expect(action).toBeFocused();
      await page.clock.fastForward(100);
      await page.keyboard.press("Enter");
      await expect(action).toHaveAttribute("aria-disabled", "true");
      await expect(action).toBeFocused();
      await page.clock.fastForward(90);
      await expect(action).toBeEnabled();
      await expect(action).toBeFocused();
      await expect(section.getByRole("status")).toContainText(answer);
      if (testInfo.project.name === "chromium" && scenario === "Translation") {
        await figure.screenshot({ path: `reports/visual/hud-action-${width}.png` });
      }
    }
    await section.getByRole("button", { name: "Reset experience" }).click();
    await expect(figure.getByRole("button")).toHaveCount(0);
    await expect(figure.locator('div[aria-hidden="true"]')).toHaveCount(0);
  });
}
