import { readFile } from "node:fs/promises";
import { createServer as createHttpServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = __dirname;
const PORT = Number(process.env.PORT) || 5200;

/**
 * Vite SSR 服务（开发中间件模式）。
 *
 * 职责：
 * - 浏览器端模块（/src/entry-client.ts、@catmasks/free-editor 及其依赖、style.css 等）
 *   由 Vite 中间件实时转译并返回给浏览器；
 * - 首页 / 由本服务执行「服务端渲染」：通过 vite.ssrLoadModule 加载服务端入口，
 *   在 Node（无 document/window）环境渲染出 HTML 字符串，从而验证
 *   @catmasks/free-editor 在 SSR 服务端可被安全 import。
 */
const vite = await createViteServer({
  root,
  server: { middlewareMode: true },
  appType: "custom",
});

/** 服务端渲染首页
 *  @param req 请求
 *  @param res 响应
 */
async function renderSsr(req, res) {
  try {
    const url = req.url || "/";

    // 读取 HTML 模板，并经 Vite 处理（注入客户端模块引用等）
    let template = await readFile(path.join(root, "index.html"), "utf-8");
    template = await vite.transformIndexHtml(url, template);

    // 服务端入口：在 Node 环境中 import 并渲染 HTML 字符串（不创建任何 DOM）
    const { render } = await vite.ssrLoadModule("/src/entry-server.ts");
    const { appHtml } = await render();

    const html = template.replace("<!--ssr-app-html-->", appHtml);

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);
  } catch (error) {
    vite.ssrFixStacktrace(error);
    console.error("[SSR] 服务端渲染失败:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(String((error && error.stack) || error));
  }
}

const server = createHttpServer((req, res) => {
  const url = req.url || "/";

  if (url === "/favicon.ico") {
    res.statusCode = 204;
    res.end();
    return;
  }

  // 客户端资源（模块转译、依赖、静态文件）交给 Vite 中间件；
  // 若 Vite 认为这不是它可处理的资源（即页面请求），则进入 SSR 渲染。
  vite.middlewares(req, res, () => {
    renderSsr(req, res);
  });
});

server.listen(PORT, () => {
  console.group(` SSR 测试服务已启动`);
  console.log(`  浏览器打开: http://localhost:${PORT}/`);
  console.log(`  服务端可正常 import @catmasks/free-editor，SSR 渲染成功。`);
  console.log(`  （编辑器实例由浏览器端在入口脚本中创建）`);
  console.groupEnd();
});
