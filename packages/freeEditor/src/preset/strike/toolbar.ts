import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 删除线图标 SVG / strike icon svg
 */
const STRIKE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" x2="20" y1="12" y2="12"/></svg>`;

/**
 * 创建删除线工具栏按钮 / Create strike toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createStrikeToolbar(editor: Editor) {
  return createSimpleToolbar({
    editor,
    iconSvg: STRIKE_ICON,
    tooltip: i18n.t("toolbar.strike"),
    isActive: () => editor.isActive("strike"),
    onClick: () => editor.commands.setStrike(),
  });
}
