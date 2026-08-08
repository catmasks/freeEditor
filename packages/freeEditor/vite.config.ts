import { defineConfig } from "vite";
import { bundleDts } from "vite-plugin-bundle-dts";
import path from "node:path";

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
     * 保持单文件样式入口
     */
    cssCodeSplit: false,

    outDir: "dist",

    rollupOptions: {
      /**
       * 外部依赖不打包进入产物
       *
       * peerDependencies:
       * - @tiptap/core
       * - @tiptap/pm
       * - @tiptap/extension-gapcursor
       *
       * dependencies:
       * - markdown-it
       * - prosemirror-markdown
       *
       * 都由用户环境提供
       */
      external: (id) => {
        const externalPkgs = [
          "@tiptap/core",
          "@tiptap/pm",
          "@tiptap/extension-gapcursor",

          "markdown-it",
          "prosemirror-markdown",
        ];

        return externalPkgs.some(
          (pkg) => id === pkg || id.startsWith(`${pkg}/`),
        );
      },

      output: {
        exports: "named",

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
       * 自动生成 dist/index.d.ts
       */
      insertTypesEntry: true,

      /**
       * 合并类型声明
       */
      rollupTypes: true,
    }),
  ],

  resolve: {
    dedupe: ["@tiptap/core", "@tiptap/pm", "@tiptap/extension-gapcursor"],
  },
});
