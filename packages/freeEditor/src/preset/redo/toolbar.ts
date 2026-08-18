import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 重做图标 SVG / Redo icon SVG
 */
const REDO_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m15 14 5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/></svg>`;

/**
 * 创建重做工具栏按钮 / Create redo toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createRedoToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: REDO_ICON,
    tooltip: { text: i18n.t("toolbar.redo"), keyboard: "ctrl + y" },
    onClick: () => editor.commands.redo(),
  });
}
