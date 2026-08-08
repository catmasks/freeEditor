/**
 * ExportPdf 插件入口
 */

import type { EditorPlugin } from "../../core";
import { ExportPdf } from "./extension";
import { createExportPdfToolbar } from "./toolbar";

/**
 * 导出 PDF 插件
 */
export const ExportPdfPlugin: EditorPlugin = {
  key: "exportPdf",
  extensions: [ExportPdf],
  toolbar: createExportPdfToolbar,
};
