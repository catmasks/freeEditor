import type { EditorPlugin } from "../../core/index";
import { ExportWord } from "./extension";
import { createExportWordToolbar } from "./toolbar";

/**
 * 导出 Word 插件
 */
export const ExportWordPlugin: EditorPlugin = {
  key: "exportWord",
  extensions: [ExportWord],
  toolbar: createExportWordToolbar,
};
