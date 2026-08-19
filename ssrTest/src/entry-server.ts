import { createSSRApp } from "vue";
import App from "./App.vue";

/**
 * 服务端渲染入口（原生 TS + Vue SSR）。
 *
 * 由 server.js 通过 vite.ssrLoadModule 在 Node 环境加载执行。
 * 这里把 App.vue「真实地执行一遍」，用 renderToString 产出真实的标记字符串，
 * 而不是拼接硬编码 HTML —— 这才是真正的 SSR。
 *
 * FreeEditor 的编辑器实例不会在此创建，它只在客户端 hydrate 后挂载。
 */
export async function render(): Promise<{ appHtml: string }> {
  const { renderToString } = await import("vue/server-renderer");
  const app = createSSRApp(App);
  const appHtml = await renderToString(app);

  return { appHtml };
}