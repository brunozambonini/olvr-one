import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = path.resolve("out");
const port = Number(process.env.PORT ?? 4173);
const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".glb": "model/gltf-binary",
};
await stat(path.join(root, "index.html"));

createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    let file = path.resolve(root, `.${pathname}`);
    if (!file.startsWith(`${root}${path.sep}`) && file !== root) {
      response.writeHead(403).end();
      return;
    }
    let status = 200;
    try {
      if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
      await stat(file);
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ENOTDIR") throw error;
      status = 404;
      file = path.join(root, "404.html");
    }
    const contentType = mime[path.extname(file)] ?? "application/octet-stream";
    const useGzip = /\bgzip\b/.test(request.headers["accept-encoding"] ?? "") &&
      /text\/|javascript|json|svg/.test(contentType);
    const source = await readFile(file);
    const body = useGzip ? gzipSync(source) : source;
    response.writeHead(status, {
      "Content-Type": contentType,
      "Content-Length": body.length,
      ...(useGzip ? { "Content-Encoding": "gzip" } : {}),
      Vary: "Accept-Encoding",
      "Cache-Control": pathname.startsWith("/_next/static/")
        ? "public, max-age=31536000, immutable"
        : pathname.startsWith("/images/")
          ? "public, max-age=3600, must-revalidate" : "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
    response.end(request.method === "HEAD" ? undefined : body);
  } catch (error) {
    response.writeHead(error instanceof URIError ? 400 : 500).end();
    console.error(error.message);
  }
}).listen(port, "127.0.0.1", () => console.log(`Static export: http://127.0.0.1:${port}`));
