import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 撤销图标 SVG / Undo icon SVG
 */
const UNDO_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>`;

/**
 * 创建撤销工具栏按钮 / Create undo toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createUndoToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: UNDO_ICON,
    tooltip: { text: i18n.t("toolbar.undo"), keyboard: "ctrl + z" },
    onClick: () => editor.commands.undo(),
  });
}
