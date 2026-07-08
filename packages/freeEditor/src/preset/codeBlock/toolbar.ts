import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 代码块图标 SVG / Code block icon SVG
 */
const CODE_BLOCK_ICON = `
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
    <path d="m10 9-3 3 3 3" />
    <path d="m14 15 3-3-3-3" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
`;

/**
 * 创建代码块工具栏按钮 / Create code block toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createCodeBlockToolbar(editor: Editor) {
  return createSimpleToolbar({
    editor,
    iconSvg: CODE_BLOCK_ICON,
    tooltip: i18n.t("toolbar.codeBlock"),
    isActive: () => editor.isActive("codeBlock"),
    onClick: () => editor.commands.setCodeBlock(),
  });
}
