import { defineConfig } from "vite";
import { bundleDts } from "vite-plugin-bundle-dts";
import path from "node:path";

/**
 * Free Editor 运行时依赖。
 *
 * 其中：
 * - Tiptap 相关依赖作为 external 处理，由使用项目提供。
 * - 部分第三方依赖作为 external 处理，运行时从使用项目加载。
 * - 需要浏览器 ESM 转换的动态依赖不放入 external，
 *   由 Vite 构建为独立的动态 chunk。
 */
const externalPackages = [
  "@tiptap/core",
  "@tiptap/pm",
  "@tiptap/extension-gapcursor",

  "jspdf",
  "docx",
  "markdown-it",
  "prosemirror-markdown",
];

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "FreeEditor",
      formats: ["es", "cjs"],
      fileName: (format) => {
        if (format === "es") {
          return "index.js";
        }

        if (format === "cjs") {
          return "index.cjs";
        }

        return "index.js";
      },
    },

    /**
     * 不拆分 CSS
     *
     * 保持单文件样式入口。
     */
    cssCodeSplit: false,

    outDir: "dist",

    rollupOptions: {
      /**
       * 将第三方依赖标记为 external。
       */
      external: (id) => {
        return externalPackages.some(
          (pkg) => id === pkg || id.startsWith(`${pkg}/`),
        );
      },

      output: {
        /**
         * 使用 named exports。
         */
        exports: "named",

        /**
         * 将动态加载产生的 JS chunk 统一放入 chunks 目录。

         */
        chunkFileNames: "chunks/[name]-[hash].js",
        /**
         * 统一 CSS 文件名称。
         */
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name;

          if (name === "style.css" || name?.endsWith(".css")) {
            return "style.css";
          }

          return name || "assets/[name][extname]";
        },
      },
    },
  },

  plugins: [
    bundleDts({
      /**
       * 自动生成 dist/index.d.ts。
       */
      insertTypesEntry: true,

      /**
       * 合并类型声明。
       */
      rollupTypes: true,
    }),
  ],

  resolve: {
    /**
     * 保证项目内部只使用同一份 Tiptap 实例。
     *
     * 对开发环境和 monorepo/workspace 场景尤其有用。
     */
    dedupe: ["@tiptap/core", "@tiptap/pm", "@tiptap/extension-gapcursor"],
  },
});
