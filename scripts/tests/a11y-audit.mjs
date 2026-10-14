import { chromium } from "playwright";
import axe from "axe-core";
import { readFile, writeFile } from "node:fs/promises";

const browser = await chromium.launch();
const report = { artifact: JSON.parse(await readFile("reports/export.json", "utf8")), browser: browser.version(), axe: axe.version, views: [] };
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto("http://127.0.0.1:4173/");
    await page.evaluate(() => document.fonts.ready);
    await page.locator("#experience").getByRole("radio", {name:"Translation",exact:true}).check();
    await page.locator("#experience").getByRole("button", {name:"Translate the menu"}).click();
    await page.locator("#experience").getByRole("status").filter({hasText:"French to English"}).waitFor();
    await page.addScriptTag({ content: axe.source });
    const result = await page.evaluate(async () => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } }));
    report.views.push({ width, violations: result.violations, incomplete: result.incomplete, passes: result.passes.map(rule => rule.id), inapplicable: result.inapplicable.map(rule => rule.id) });
    await page.close();
  }
} finally { await browser.close(); }
await writeFile("reports/validation-expansion-a11y.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify({ browser: report.browser, axe: report.axe, views: report.views.map(view => ({ width: view.width, violations: view.violations.map(rule => ({ id: rule.id, impact: rule.impact, nodes: rule.nodes.map(node => ({ target: node.target, failureSummary: node.failureSummary })) })), incomplete: view.incomplete.map(rule => rule.id) })) }, null, 2));
if (report.views.some(view => view.violations.length)) process.exitCode = 1;
