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

/**
 * 统一 CSS 文件名称。
 *
 * 保持单文件样式入口 style.css，供各输出格式复用。
 */
function cssAssetName(assetInfo: {
  name?: string;
}): string {
  const name = assetInfo.name;

  if (name === "style.css" || name?.endsWith(".css")) {
    return "style.css";
  }

  return name || "assets/[name][extname]";
}

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "FreeEditor",
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

      /**
       * 分格式输出：es 格式的 chunk 使用 .js，cjs 格式的 chunk 使用 .cjs。
       *
       * 由于本包 package.json 声明了 "type": "module"，若 cjs 构建产生的
       * 共享 runtime chunk 也使用 .js 扩展名，Node 会将其按 ESM 解析，
       * 导致 require() 时 "exports is not defined" 崩溃（SSR/CommonJS 场景）。
       *
       * 因此这里通过输出数组为不同格式指定各自的 chunk 扩展名：
       * - es 格式：.js（浏览器/CDN 的 MIME 兼容）
       * - cjs 格式：.cjs（被 require() 正确识别为 CommonJS）
       *
       * 注意：当提供 output 数组时，Vite/Rolldown 会忽略 build.lib.formats，
       * 因此需要在每个输出上显式声明 format，否则二者都会按 es 构建并互相覆盖。
       */
      output: [
        {
          format: "es",
          entryFileNames: "index.js",
          exports: "named",
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: cssAssetName,
        },
        {
          format: "cjs",
          entryFileNames: "index.cjs",
          exports: "named",
          chunkFileNames: "chunks/[name]-[hash].cjs",
          assetFileNames: cssAssetName,
        },
      ],
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
