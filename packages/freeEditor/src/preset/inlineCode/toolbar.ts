import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 行内代码图标 SVG / Inline code icon SVG
 */
const INLINE_CODE_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>
`;

/**
 * 创建行内代码工具栏按钮 / Create inline code toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createInlineCodeToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: INLINE_CODE_ICON,
    tooltip: { text: i18n.t("toolbar.inlineCode"), keyboard: "ctrl + e" },
    isActive: () => editor.isActive("inlineCode"),
    onClick: () => editor.commands.setInlineCode(),
  });
}
