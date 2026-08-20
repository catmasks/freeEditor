import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../../ui/index";
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
  <path
    d="M6 2h8l4 4v9"
  />
  <path
    d="M14 2v4h4"
  />
  <path
    d="M6 2
       a2 2 0 0 0-2 2
       v16
       a2 2 0 0 0 2 2
       h8"
  />
  <path
  d="
  M11 10
  c0-1.2-1.2-1.2-1.2 0
  c0 2 .6 3.2-.8 4.5
  c-1.2 1-2.8.8-2.8 0
  c0-1 2-1.4 3.5-1.8
  c2-.5 3.5 0 4.8.8
  "
/>
<path
  d="M18 17v5"
/>
<path
  d="M16 20l2 2 2-2"
/>
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
