import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

// Only a manually dispatched, approved production job may publish this export.
if (process.env.GITHUB_ACTIONS !== "true" || process.env.GITHUB_EVENT_NAME !== "workflow_dispatch" ||
    process.env.OLVR_PUBLISH !== "publish-reviewed-export") {
  throw new Error("Publication is disabled. Use the authorized manual production workflow after reviewing its exact revision.");
}
for (const key of ["GITHUB_TOKEN", "GITHUB_SHA", "GITHUB_REPOSITORY", "GITHUB_REF_NAME", "DEFAULT_BRANCH",
  "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_PROJECT_NAME"]) {
  if (!process.env[key]) throw new Error(`Missing required configuration: ${key}`);
}
const { GITHUB_SHA: revision, GITHUB_REF_NAME: branch, DEFAULT_BRANCH: defaultBranch } = process.env;
if (!/^[a-f0-9]{40}$/.test(revision) || branch !== defaultBranch) throw new Error("Only the default branch can publish.");
const validated = JSON.parse(await readFile("reports/export.json", "utf8"));
if (validated.revision !== revision || validated.errors.length) throw new Error("Artifact was not validated for this revision.");
const smoke = spawnSync(process.execPath, ["scripts/check-export.mjs"], { stdio: "inherit" });
if (smoke.status !== 0) throw new Error("Export integrity check failed.");
const current = JSON.parse(await readFile("reports/export.json", "utf8"));
if (current.artifactSha256 !== validated.artifactSha256) throw new Error("Export differs from the tested artifact.");

const response = await fetch(`${process.env.GITHUB_API_URL ?? "https://api.github.com"}/repos/${process.env.GITHUB_REPOSITORY}/commits/${encodeURIComponent(defaultBranch)}`, {
  headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, Accept: "application/vnd.github+json" },
});
if (!response.ok) throw new Error(`Cannot verify latest revision: HTTP ${response.status}.`);
if ((await response.json()).sha !== revision) throw new Error("A newer revision exists; publish its validated artifact instead.");
console.log(`Publishing validated revision ${revision}; artifact ${validated.artifactSha256}.`);
const deploy = spawnSync(process.execPath, ["node_modules/wrangler/bin/wrangler.js", "pages", "deploy", "out",
  "--project-name", process.env.CLOUDFLARE_PROJECT_NAME, "--branch", defaultBranch, "--commit-hash", revision], { stdio: "inherit" });
if (deploy.error) throw deploy.error;
process.exitCode = deploy.status ?? 1;
