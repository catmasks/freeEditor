import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 下划线图标 SVG / underline icon svg
 */
const UNDERLINE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></svg>`;

/**
 * 创建下划线工具栏按钮 / Create underline toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createUnderlineToolbar(editor: Editor) {
  return createSimpleToolbar({
    editor,
    iconSvg: UNDERLINE_ICON,
    tooltip: i18n.t("toolbar.underline"),
    isActive: () => editor.isActive("underline"),
    onClick: () => editor.commands.setUnderline(),
  });
}
