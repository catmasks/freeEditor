import type { Editor } from "@tiptap/core";
import { createColorPickerToolbar } from "../toolbar";

import { i18n } from "../../core/utils/index";

/**
 * 文本高亮图标 SVG / Font highlight icon SVG
 */
const FONT_HIGHLIGHT_ICON = `
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
    <path d="m9 11-6 6v3h9l3-3" />
    <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
    <path d="M5 20h14" />
  </svg>
`;

/**
 * 创建文本高亮工具栏 / Create font highlight toolbar
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 颜色选择器工具栏元素 / Color picker toolbar element
 */
export function createFontHighlightToolbar(editor: Editor) {
  return createColorPickerToolbar({
    editor,
    iconSvg: FONT_HIGHLIGHT_ICON,
    tooltip: i18n.t("toolbar.fontHighlight"),
    getCurrentColor: () =>
      editor.getAttributes("style").backgroundColor || null,
    setColor: (color) => {
      if (!color) {
        editor.chain().focus().unsetHighlight().run();
        return;
      }
      editor.chain().focus().setHighlight(color).run();
    },
  });
}
