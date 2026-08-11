import { defineConfig } from "vite";
import { bundleDts } from "vite-plugin-bundle-dts";
import path from "node:path";

/**
 * Free Editor 运行时依赖
 * 这些依赖全部声明在 package.json 的 dependencies 中。
 * 构建时将它们标记为 external，不将第三方依赖代码重复打包进
 * 用户安装 @catmasks/free-editor 时，pnpm/npm 会自动安装这些 dependencies。
 */
const externalPackages = [
  "@tiptap/core",
  "@tiptap/pm",
  "@tiptap/extension-gapcursor",

  "docx",
  "file-saver",
  "html2canvas",
  "jspdf",
  "mammoth",
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
