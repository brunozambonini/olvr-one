import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = path.resolve("out");
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => entry.isDirectory()
    ? filesIn(path.join(directory, entry.name)) : path.join(directory, entry.name)));
  return files.flat().sort();
}
const files = await filesIn(root);
const errors = [];
const index = await readFile(path.join(root, "index.html"), "utf8");
for (const required of ["404.html", "_headers"]) {
  if (!files.includes(path.join(root, required))) errors.push(`Missing out/${required}`);
}
if (files.length > 20_000) errors.push("Export exceeds the Pages Free 20,000-file limit.");
const digest = createHash("sha256");
for (const file of files) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (relative === "_worker.js" || relative.startsWith("functions/")) errors.push(`Unexpected server runtime: ${relative}`);
  const data = await readFile(file);
  if (data.length > 25 * 1024 * 1024) errors.push(`Asset exceeds 25 MiB: ${relative}`);
  digest.update(relative).update("\0").update(data).update("\0");
}
const scripts = new Set([...index.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]));
let initialJsGzip = 0;
for (const url of scripts) {
  if (!url.startsWith("/") || url.startsWith("//")) {
    errors.push(`Unexpected external script: ${url}`);
    continue;
  }
  const script = path.resolve(root, `.${decodeURIComponent(url.split("?")[0])}`);
  if (!script.startsWith(`${root}${path.sep}`)) throw new Error(`Invalid asset URL: ${url}`);
  initialJsGzip += gzipSync(await readFile(script)).length;
}
if (initialJsGzip > 250 * 1024) errors.push(`Initial script gzip ${(initialJsGzip / 1024).toFixed(1)} KiB exceeds 250 KiB.`);
const manifest = JSON.parse(await readFile("assets/images.json", "utf8"));
for (const entry of manifest.images) {
  for (const width of entry.widths) {
    for (const format of ["avif", "webp"]) {
      const image = path.join(root, "images", `${entry.id}-${width}.${format}`);
      try {
        const size = (await stat(image)).size;
        if (entry.id === "hero" && size > (width <= 960 ? 250 : 450) * 1024) {
          errors.push(`Hero budget exceeded: ${path.basename(image)} (${(size / 1024).toFixed(1)} KiB)`);
        }
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        errors.push(`Missing responsive image: ${image}`);
      }
    }
  }
}
if (!scripts.size) errors.push("No application scripts found in index.html.");
const report = { generatedAt: new Date().toISOString(), command: "npm run smoke",
  revision: process.env.GITHUB_SHA ?? process.env.SOURCE_REVISION ?? "uncommitted-local",
  environment: { node: process.version, platform: process.platform, arch: process.arch },
  files: files.length, initialJsGzip, artifactSha256: digest.digest("hex"), errors };
await mkdir("reports", { recursive: true });
await writeFile("reports/export.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
