import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 上标图标 SVG / Superscript icon SVG
 */
const SUPERSCRIPT_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 19 8-8"/><path d="m12 19-8-8"/><path d="M20 12h-4c0-1.5.442-2 1.5-2.5S20 8.334 20 7.002c0-.472-.17-.93-.484-1.29a2.105 2.105 0 0 0-2.617-.436c-.42.239-.738.614-.899 1.06"/></svg>
`;

/**
 * 创建上标工具栏按钮 / Create superscript toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createSuperscriptToolbar(editor: Editor) {
  return createSimpleToolbar({
    editor,
    iconSvg: SUPERSCRIPT_ICON,
    tooltip: {
      text: i18n.t("toolbar.superscript"),
      keyboard: "ctrl + shift + .",
    },
    isActive: () => editor.isActive("superscript"),
    onClick: () => editor.commands.setSuperscript(),
  });
}
