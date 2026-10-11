// Servidor estático que imita GitHub Pages para probar el export bajo subpath:
// /<base>/ruta/ → out/ruta/index.html · /<base>/ruta → 301 a /<base>/ruta/ · inexistente → out/404.html (404)
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const ROOT = join(process.cwd(), "out");
const BASE = (process.env.PAGES_BASE_PATH ?? "").replace(/\/+$/, "");
const PORT = Number(process.env.E2E_PORT ?? 4173);
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".json": "application/json", ".woff2": "font/woff2", ".woff": "font/woff" };

function send(res, file, status = 200) {
  res.writeHead(status, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (req.method !== "GET" && req.method !== "HEAD") return res.writeHead(405).end();
  if (BASE && !url.pathname.startsWith(`${BASE}/`) && url.pathname !== BASE) return send(res, join(ROOT, "404.html"), 404);
  const rel = decodeURIComponent(url.pathname.slice(BASE.length)) || "/";
  const path = normalize(join(ROOT, rel));
  if (!path.startsWith(ROOT)) return res.writeHead(403).end();
  if (existsSync(path) && statSync(path).isDirectory()) {
    if (!url.pathname.endsWith("/")) return res.writeHead(301, { location: `${url.pathname}/${url.search}` }).end();
    const index = join(path, "index.html");
    return existsSync(index) ? send(res, index) : send(res, join(ROOT, "404.html"), 404);
  }
  if (existsSync(path)) return send(res, path);
  return send(res, join(ROOT, "404.html"), 404);
}).listen(PORT, () => console.log(`static: http://localhost:${PORT}${BASE}/`));
