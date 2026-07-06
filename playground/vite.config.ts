import { defineConfig } from "vite";

import path from "node:path";

/**
 * playground vite config
 */
export default defineConfig({
  resolve: {
    alias: {
      /**
       * 直接指向源码
       */
      // "@cat/free-editor": path.resolve(
      //   __dirname,
      //   "../packages/free-editor/src",
      //   // "../packages/free-editor/dist",
      // ),
    },

    /**
     * 强制去重
     */
    dedupe: ["@tiptap/core", "@tiptap/pm", "@tiptap/extension-gapcursor"],
  },

  optimizeDeps: {
    /**
     * 不预构建 workspace editor
     */
    exclude: ["@cat/free-editor"],
  },

  server: {
    port: 2000,
  },
});
