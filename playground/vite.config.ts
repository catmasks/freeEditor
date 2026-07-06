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
      // "@catmasks/free-editor": path.resolve(
      //   __dirname,
      //   "../packages/freeEditor/src",
      //   // "../packages/freeEditor/dist",
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
    exclude: ["@catmasks/free-editor"],
  },

  server: {
    port: 2000,
  },
});
