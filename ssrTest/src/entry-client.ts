import { Editor } from "@catmasks/free-editor";
import "@catmasks/free-editor/style.css";

/**
 * 客户端入口（原生 TS）。
 *
 * 只在浏览器端执行：找到 SSR 渲染出的编辑器挂载点并创建编辑器实例。
 */
const mount = document.getElementById("editor");

if (!mount) {
  throw new Error("[Client] 未找到编辑器挂载点 #editor");
}

const editor = new Editor(mount, {
  locale: "zh-CN",
  height: 320,
  content: "<p>你好，原生 TypeScript SSR 世界！</p>",
});

// 供控制台调试/清理使用
(window as unknown as { __freeEditor?: typeof editor }).__freeEditor = editor;