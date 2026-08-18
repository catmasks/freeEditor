import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 增加缩进图标 SVG / Indent icon SVG
 */
const INDENT_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H11"/><path d="M21 12H11"/><path d="M21 19H11"/><path d="m3 8 4 4-4 4"/></svg>
`;

/**
 * 创建增加缩进工具栏按钮 / Create indent toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createIndentToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: INDENT_ICON,
    tooltip: { text: i18n.t("toolbar.indent"), keyboard: "tab" },
    onClick: () => editor.commands.setIndent(),
  });
}
