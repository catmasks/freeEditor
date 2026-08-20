import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../../ui/index";

import { i18n } from "../../core/index";

/**
 * 分割线图标 SVG / Divider icon SVG
 *
 * 表示一条水平分割线的图标
 * Represents a horizontal divider line icon
 */
const DIVIDER_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>
`;

/**
 * 创建分割线工具栏按钮 / Create divider toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createDividerToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: DIVIDER_ICON,
    tooltip: {
      text: i18n.t("toolbar.divider"),
      keyboard: "ctrl + shift + h",
    },
    onClick: () => editor.commands.setDivider(),
  });
}
