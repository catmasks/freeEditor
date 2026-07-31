import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 引用图标 SVG / Blockquote icon SVG
 */
const BLOCKQUOTE_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/></svg>
`;

/**
 * 创建引用工具栏按钮 / Create blockquote toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createBlockquoteToolbar(editor: Editor) {
  return createSimpleToolbar({
    editor,
    iconSvg: BLOCKQUOTE_ICON,
    tooltip: {
      text: i18n.t("toolbar.blockquote"),
      keyboard: "ctrl + shift + b",
    },
    isActive: () => editor.isActive("blockquote"),
    onClick: () => editor.commands.toggleBlockquote(),
  });
}
