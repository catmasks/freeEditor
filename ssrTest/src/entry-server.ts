import { i18n } from "@catmasks/free-editor";

/**
 * 服务端渲染函数（原生 TS）。
 *
 * 由 server.js 通过 vite.ssrLoadModule 在 Node 环境加载执行；
 * 仅返回 HTML 字符串，不创建任何 DOM。读取 i18n.locale 用于证明：
 * SSR 服务端可以安全 import @catmasks/free-editor。
 */
export async function render(): Promise<{ appHtml: string }> {
  // 服务端 SSR 阶段读取的语言（来自包内 i18n 单例）
  const locale = i18n.locale;

  const appHtml = `
  <h1>原生 TypeScript SSR + @catmasks/free-editor</h1>
  <p class="note">
    <span class="ssr-badge">SSR</span>
    这段内容由「服务端」生成：SSR 语言(locale) = <code>${locale}</code>
    —— 说明服务端已安全加载 <code>@catmasks/free-editor</code>。
  </p>
  <hr />
  <p class="note">
    <span class="ssr-badge">Client</span>
    下方编辑器由「浏览器端」通过 <code>new Editor(el)</code> 挂载：
  </p>
  <div id="editor" style="border:1px solid #d0d7de;border-radius:6px"></div>
  `;

  return { appHtml };
}