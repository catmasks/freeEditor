import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/utils/index";

/**
 * 粗体图标 SVG / Bold icon SVG
 */
const BOLD_ICON = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
  </svg>
`;

/**
 * 创建粗体工具栏按钮 / Create bold toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createBoldToolbar(editor: Editor) {
  return createSimpleToolbar({
    editor,
    iconSvg: BOLD_ICON,
    tooltip: i18n.t("toolbar.bold"),
    isActive: () => editor.isActive("bold"),
    onClick: () => editor.commands.setBold(),
  });
}
