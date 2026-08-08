/**
 * 导出 PDF 工具栏按钮
 *
 * 点击后调用 editor.commands.exportPdf() 导出当前内容为 PDF 文档
 */

import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";
import { i18n } from "../../core/index";

/**
 * 导出 PDF 图标 SVG
 */
const EXPORT_PDF_ICON = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.8"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  <polyline points="14 2 14 8 20 8" />
  <path d="M9 15h6" />
  <path d="M12 12v6" />
</svg>
`;

/**
 * 创建导出 PDF 工具栏按钮
 *
 * @param editor 编辑器实例
 * @returns 工具栏按钮元素
 */
export function createExportPdfToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: EXPORT_PDF_ICON,
    tooltip: { text: i18n.t("pdf.export"), keyboard: "" },
    onClick: () => {
      editor.commands.exportPdf();
    },
  });
}