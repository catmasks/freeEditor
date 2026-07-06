import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

/**
 * 斜体图标 SVG / Italic icon SVG
 */
const ITALIC_ICON = `<svg
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
  <line x1="19" x2="10" y1="4" y2="4" />
  <line x1="14" x2="5" y1="20" y2="20" />
  <line x1="15" x2="9" y1="4" y2="20" />
</svg>`;

/**
 * 创建斜体工具栏按钮 / Create italic toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createItalicToolbar(editor: Editor) {
  return createSimpleToolbar({
    editor,
    iconSvg: ITALIC_ICON,
    tooltip: "斜体",
    isActive: () => editor.isActive("italic"),
    onClick: () => editor.commands.setItalic(),
  });
}
