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
        if (format === "es") return "index.js";
        if (format === "cjs") return "index.cjs";
        return "index.js";
      },
    },
    cssCodeSplit: false,
    outDir: "dist",
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
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
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
  optimizeDeps: {
    exclude: [
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
