import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../../ui/index";

import { i18n } from "../../core/index";

/**
 * 有序列表图标 SVG / Ordered list icon SVG
 */
const ORDERED_LIST_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5h10"/><path d="M11 12h10"/><path d="M11 19h10"/><path d="M4 4h1v5"/><path d="M4 9h2"/><path d="M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02"/></svg>
`;

/**
 * 创建有序列表工具栏按钮 / Create ordered list toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createOrderedListToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: ORDERED_LIST_ICON,
    tooltip: {
      text: i18n.t("toolbar.orderedList"),
      keyboard: "ctrl + shift + 7",
    },
    isActive: () => editor.isActive("orderedList"),
    onClick: () => editor.commands.toggleOrderedList(),
  });
}
