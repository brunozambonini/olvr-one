import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

// Temporary, explicit tooling exception; see docs/dependency-audit.md.
const knownNames = new Set(["braces", "micromatch", "fast-glob", "@next/eslint-plugin-next", "eslint-config-next"]);
const knownAdvisory = "https://github.com/advisories/GHSA-vfj7-8cjw-p6xm";
await mkdir("reports", { recursive: true });
for (const production of [false, true]) {
  const result = spawnSync(process.execPath,
    [process.env.npm_execpath, "audit", "--json", ...(production ? ["--omit=dev"] : [])],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  if (result.error) throw result.error;
  const report = JSON.parse(result.stdout);
  if (report.error || !report.vulnerabilities) throw new Error("npm audit did not return a valid report.");
  await writeFile(`reports/audit-${production ? "production" : "all"}.json`, `${JSON.stringify(report, null, 2)}\n`);
  const unexpected = Object.entries(report.vulnerabilities).filter(([name, vulnerability]) => production ||
    !knownNames.has(name) || vulnerability.severity !== "high" ||
    vulnerability.via.some((via) => typeof via === "string" ? !knownNames.has(via) : via.url !== knownAdvisory));
  console.log(`${production ? "Production" : "All dependencies"}: ${Object.keys(report.vulnerabilities).length} audit entries; ${unexpected.length} outside the documented tooling exception.`);
  if (unexpected.length) process.exitCode = 1;
}
