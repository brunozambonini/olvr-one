import { readFile } from "node:fs/promises";
import { test as base, expect, type Page } from "@playwright/test";

type NetworkIssue = { url: string; detail: string };

export const test = base.extend<{ diagnostics: void }>({
  diagnostics: [async ({ page, browser }, use, testInfo) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    const networkIssues: NetworkIssue[] = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    page.on("console", message => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("requestfailed", request => networkIssues.push({ url: request.url(), detail: request.failure()?.errorText ?? "failed" }));
    page.on("response", response => {
      if (response.status() >= 400) networkIssues.push({ url: response.url(), detail: `HTTP ${response.status()}` });
    });
    await use();
    const expectedPaths = testInfo.annotations.filter(item => item.type === "expected-network").map(item => item.description ?? "");
    const expectedNetwork = networkIssues.filter(item => expectedPaths.some(path => item.url.includes(path)));
    const unexpectedNetwork = networkIssues.filter(item => !expectedPaths.some(path => item.url.includes(path)));
    const expectedConsole = expectedPaths.length ? consoleErrors.filter(message => /Failed to load resource|Loading failed|NS_ERROR|net::ERR_FAILED|404 \(Not Found\)/i.test(message)) : [];
    const unexpectedConsole = consoleErrors.filter(message => !expectedConsole.includes(message));
    await testInfo.attach("browser-diagnostics", {
      body: JSON.stringify({ browser: testInfo.project.name, version: browser.version(), artifact: JSON.parse(await readFile("reports/export.json", "utf8")), expectedNetwork, unexpectedNetwork, expectedConsole, unexpectedConsole, pageErrors }, null, 2),
      contentType: "application/json",
    });
    expect(pageErrors, "uncaught application errors").toEqual([]);
    expect(unexpectedNetwork, "unexpected network failures").toEqual([]);
    expect(unexpectedConsole, "unexpected console errors").toEqual([]);
  }, { auto: true }],
});

export { expect };

export async function openConfigurator(page: Page) {
  await page.goto("/");
  await page.locator("#configure").scrollIntoViewIfNeeded();
  await expect(page.locator("#configure").getByRole("status")).toHaveText("Showing Obsidian / Clear.");
  await expect.poll(() => page.locator('#configure figure img').first().evaluate(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
}

export async function expectVariant(page: Page, label: string, id: string) {
  for (const name of label.split(" / ")) await expect(page.locator("#configure").getByRole("radio", { name, exact: true })).toBeChecked();
  const figure = page.getByRole("figure", { name: "Product preview" });
  await expect(figure).toHaveAttribute("data-displayed-variant", id);
  await expect(figure).toHaveAttribute("aria-busy", "false");
  await expect(figure.locator("figcaption")).toContainText(label);
  await expect(page.locator("#configure").getByRole("status")).toHaveText(`Showing ${label}.`);
  await expect.poll(() => figure.locator("img").first().evaluate(image => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0 ? image.currentSrc : "")).toContain(`/images/${id}-`);
}

export function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => { resolve = done; });
  return { promise, resolve };
}

export async function selectVariant(page: Page, label: string) {
  await page.locator("#configure").evaluate((section, names) => { for (const name of names) { const label = [...section.querySelectorAll("label")].find(label => label.textContent?.trim().replace("✓", "").trim() === name); (label?.querySelector("input") as HTMLInputElement).click(); } }, label.split(" / "));
}
