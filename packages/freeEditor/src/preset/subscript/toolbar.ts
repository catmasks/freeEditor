import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 下标图标 SVG / Subscript icon SVG
 */
const SUBSCRIPT_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 5 8 8"/><path d="m12 5-8 8"/><path d="M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14c0-.47-.17-.93-.48-1.29a2.11 2.11 0 0 0-2.62-.44c-.42.24-.74.62-.9 1.07"/></svg>
`;

/**
 * 创建下标工具栏按钮 / Create subscript toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createSubscriptToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: SUBSCRIPT_ICON,
    tooltip: {
      text: i18n.t("toolbar.subscript"),
      keyboard: "ctrl + shift + ,",
    },
    isActive: () => editor.isActive("subscript"),
    onClick: () => editor.commands.setSubscript(),
  });
}
