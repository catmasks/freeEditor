import { defineConfig } from "vite";
import { bundleDts } from "vite-plugin-bundle-dts";
import path from "node:path";

/**
 * FreeEditor Library Build
 */
export default defineConfig({
  /**
   * Vite 构建配置
   */
  build: {
    lib: {
      /**
       * 入口
       */
      entry: path.resolve(__dirname, "src/index.ts"),

      /**
       * UMD 全局变量名
       */
      name: "FreeEditor",

      /**
       * 输出格式
       */
      formats: ["es", "cjs", "umd"],

      /**
       * 输出文件名
       */
      fileName: (format) => {
        if (format === "es") return "index.js";
        if (format === "cjs") return "index.cjs";
        return "index.min.js";
      },
    },

    /**
     * CSS 单独输出
     */
    cssCodeSplit: false,

    /**
     * 输出目录
     */
    outDir: "dist",

    /**
     * Rollup 核心配置
     */
    rollupOptions: {
      external: (id) => {
        const externalPkgs = [
          "@tiptap/core",
          "@tiptap/pm",
          "@tiptap/extension-gapcursor",
        ];

        return externalPkgs.some(
          (pkg) => id === pkg || id.startsWith(pkg + "/"),
        );
      },

      output: {
        /**
         * 保持 ES named export
         */
        exports: "named",

        /**
         * 统一 CSS 输出文件名
         */
        assetFileNames: (assetInfo) => {
          if (
            assetInfo.name === "style.css" ||
            assetInfo.name?.endsWith(".css")
          ) {
            return "style.css";
          }
          return assetInfo.name || "assets/[name][extname]";
        },

        /**
         * UMD 全局映射
         */
        globals: {
          "@tiptap/core": "TiptapCore",
          "@tiptap/pm": "ProseMirror",
          "@tiptap/pm/state": "ProseMirror",
          "@tiptap/pm/view": "ProseMirror",
          "@tiptap/extension-gapcursor": "GapCursor",
        },
      },
    },
  },

  /**
   * 插件
   */
  plugins: [
    /**
     * TS 类型生成
     * 使用 bundleDts 将所有类型声明合并到一个文件，去掉二级目录结构
     */
    bundleDts({
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],

  /**
   * 依赖去重
   */
  resolve: {
    dedupe: [
      "@tiptap/core",
      "@tiptap/pm",
      "@tiptap/extension-gapcursor",
      "prosemirror-state",
      "prosemirror-view",
      "prosemirror-model",
      "prosemirror-transform",
    ],
  },

  /**
   * 防止 Vite 预打包污染
   */
  optimizeDeps: {
    exclude: [
      "@cat/free-editor",

      "@tiptap/core",
      "@tiptap/pm",
      "@tiptap/extension-gapcursor",

      "prosemirror-state",
      "prosemirror-view",
      "prosemirror-model",
      "prosemirror-transform",
    ],
  },
});
