import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

/**
 * 原生 TypeScript SSR 测试包。
 *
 * 本包通过 Vite 别名直接消费 packages/freeEditor 的构建产物（dist），
 * 从而模拟真实场景中 "import { Editor } from '@catmasks/free-editor'"，
 * 用于验证该 npm 包在 SSR 环境下的兼容性。
 *
 * 由于沙箱环境无法为 workspace 依赖创建软链，这里改用显示别名，
 * 并同时映射 style.css 子路径（否则会绕过 exports 子路径解析）。
 */
export default defineConfig({
  resolve: {
    alias: [
      // 注意：style.css 子路径需放在包入口别名之前（更具体匹配）
      {
        find: "@catmasks/free-editor/style.css",
        replacement: fileURLToPath(
          new URL("../packages/freeEditor/dist/style.css", import.meta.url),
        ),
      },
      // 包入口指向 dist/index.js（ESM 产物）
      {
        find: "@catmasks/free-editor",
        replacement: fileURLToPath(
          new URL("../packages/freeEditor/dist/index.js", import.meta.url),
        ),
      },
    ],
    // 强制去重，保证整个应用只使用同一份 Tiptap 实例
    dedupe: ["@tiptap/core", "@tiptap/pm", "@tiptap/extension-gapcursor"],
  },

  optimizeDeps: {
    // 不预构建 editor，交由 Vite 动态处理
    exclude: ["@catmasks/free-editor"],
  },

  server: {
    port: 5200,
  },
});