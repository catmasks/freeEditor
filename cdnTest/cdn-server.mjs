import { createServer } from "node:http";
import { readFile } from "node:fs";
import { extname, join, normalize } from "node:path";

/** 静态服务根目录 */
const ROOT = normalize(join(import.meta.dirname, "..", "cdnTest"));
const PORT = 2001;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".json": "application/json",
};

createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  const filePath = normalize(join(ROOT, url === "/" ? "index.html" : url));

  // 防止路径穿越到 cdnTest 之外
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("403 Forbidden");
    return;
  }

  readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[extname(filePath)] || "application/octet-stream",
    });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`FreeEditor CDN 测试已启动: http://localhost:${PORT}`);
});
