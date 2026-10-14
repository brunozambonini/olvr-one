import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoot = path.join(root, "assets", "masters");
const outputRoot = path.join(root, "public", "images");
const cacheRoot = path.join(root, ".cache");
const manifest = JSON.parse(await readFile(path.join(root, "assets", "images.json"), "utf8"));
const formats = { avif: { quality: 55, effort: 4 }, webp: { quality: 82, effort: 6 } };
const ids = new Set();
const sources = [];

if (manifest.version !== 1 || !Array.isArray(manifest.images) || !manifest.images.length) {
  throw new Error("assets/images.json must contain version: 1 and a non-empty images array.");
}

for (const entry of manifest.images) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) || ids.has(entry.id)) {
    throw new Error(`Invalid or duplicate image id: ${entry.id}`);
  }
  ids.add(entry.id);
  if (typeof entry.source !== "string" || path.basename(entry.source) !== entry.source) {
    throw new Error(`${entry.id}: source must be a filename inside assets/masters.`);
  }
  if (!Array.isArray(entry.widths) || !entry.widths.length ||
      entry.widths.some((width) => !Number.isInteger(width) || width < 1) ||
      new Set(entry.widths).size !== entry.widths.length) {
    throw new Error(`${entry.id}: widths must be unique positive integers.`);
  }
  const input = await readFile(path.join(sourceRoot, entry.source));
  const metadata = await sharp(input).metadata();
  const sourceWidth = metadata.autoOrient?.width ?? metadata.width;
  if (!sourceWidth || entry.widths.some((width) => width > sourceWidth)) {
    throw new Error(`${entry.id}: requested width exceeds master width ${sourceWidth}; upscaling is disabled.`);
  }
  sources.push({ entry, input, digest: createHash("sha256").update(input).digest("hex") });
}

await mkdir(outputRoot, { recursive: true });
await mkdir(cacheRoot, { recursive: true });
let previous = {};
try {
  previous = JSON.parse(await readFile(path.join(cacheRoot, "image-cache.json"), "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const cache = {};
const report = [];

for (const { entry, input, digest } of sources) {
  for (const width of entry.widths) {
    for (const [format, settings] of Object.entries(formats)) {
      const name = `${entry.id}-${width}.${format}`;
      const output = path.join(outputRoot, name);
      const signature = JSON.stringify({ digest, width, format, settings, sharp: sharp.versions });
      let exists = false;
      try { exists = (await stat(output)).isFile(); } catch (error) { if (error.code !== "ENOENT") throw error; }
      if (previous[name] !== signature || !exists) {
        await sharp(input).rotate().resize({ width, withoutEnlargement: true })
          .toFormat(format, settings).toFile(output);
      }
      const metadata = await sharp(output).metadata();
      if (metadata.width !== width) throw new Error(`${name}: generated width does not match its filename.`);
      cache[name] = signature;
      report.push({ path: `/images/${name}`, width, height: metadata.height,
        bytes: (await stat(output)).size, source: entry.source, sourceSha256: digest });
    }
  }
}

await writeFile(path.join(cacheRoot, "image-cache.json"), `${JSON.stringify(cache, null, 2)}\n`);
await writeFile(path.join(cacheRoot, "image-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Images: ${report.length} AVIF/WebP files, ${(report.reduce((sum, file) => sum + file.bytes, 0) / 1024).toFixed(0)} KiB total. Details: .cache/image-report.json`);
