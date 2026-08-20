import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../../ui/index";

import { i18n } from "../../core/index";

/**
 * 无序列表图标 SVG / Bullet list icon SVG
 */
const BULLET_LIST_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/></svg>
`;

/**
 * 创建无序列表工具栏按钮 / Create bullet list toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createBulletListToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: BULLET_LIST_ICON,
    tooltip: {
      text: i18n.t("toolbar.bulletList"),
      keyboard: "ctrl + shift + 8",
    },
    isActive: () => editor.isActive("bulletList"),
    onClick: () => editor.commands.toggleBulletList(),
  });
}
