import type { Editor } from "@tiptap/core";
import { createColorPickerToolbar } from "../toolbar";

import { i18n } from "../../core/utils/index";

/**
 * 字体颜色图标 SVG / Font color icon SVG
 */
const FONT_COLOR_ICON = `
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
    <path d="M4 20h16" />
    <path d="m6 16 6-12 6 12" />
    <path d="M8 12h8" />
  </svg>
`;

/**
 * 创建字体颜色工具栏 / Create font color toolbar
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 颜色选择器工具栏元素 / Color picker toolbar element
 */
export function createFontColorToolbar(editor: Editor) {
  return createColorPickerToolbar({
    editor,
    iconSvg: FONT_COLOR_ICON,
    tooltip: i18n.t("toolbar.fontColor"),
    getCurrentColor: () => editor.getAttributes("style").color || null,
    setColor: (color) => {
      if (!color) {
        editor.chain().focus().unsetColor().run();
        return;
      }
      editor.chain().focus().setColor(color).run();
    },
  });
}
