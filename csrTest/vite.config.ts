import { defineConfig } from "vite";

import path from "node:path";

/**
 * csrTest vite config
 */
export default defineConfig({
  resolve: {
    alias: [
      // style.css 子路径需放在包入口别名之前
      {
        find: "@catmasks/free-editor/style.css",
        replacement: path.resolve(
          __dirname,
          "../packages/freeEditor/dist/style.css",
        ),
      },
      //csrTest 开发时直接调试库源码
      {
        find: "@catmasks/free-editor",
        replacement: path.resolve(__dirname, "../packages/freeEditor/src"),
      },
    ],
    /**
     * 强制去重
     */
    dedupe: ["@tiptap/core", "@tiptap/pm", "@tiptap/extension-gapcursor"],
  },

  optimizeDeps: {
    /**
     * 不预构建 workspace editor
     */
    exclude: ["@catmasks/free-editor"],
  },

  server: {
    port: 2000,
  },
});
