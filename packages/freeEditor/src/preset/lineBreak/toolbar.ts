import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 软换行图标 SVG / Line break icon SVG
 *
 * 表示换行符号（↵ 样式的箭头回到行首）
 * Represents a line break symbol (carriage return style arrow)
 */
const LINE_BREAK_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 5H3"/><path d="M16 12H3"/><path d="M9 19H3"/><path d="m16 16-3 3 3 3"/><path d="M21 5v12a2 2 0 0 1-2 2h-6"/></svg>
`;

/**
 * 创建软换行工具栏按钮 / Create line break toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createLineBreakToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: LINE_BREAK_ICON,
    tooltip: { text: i18n.t("toolbar.lineBreak"), keyboard: "shift + enter" },
    onClick: () => editor.commands.setLineBreak(),
  });
}
