import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../../ui/index";

import { i18n } from "../../core/index";

/**
 * 减少缩进图标 SVG / Outdent icon SVG
 */
const OUTDENT_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ><path d="M21 5H11"/><path d="M21 12H11"/><path d="M21 19H11"/><path d="m7 8-4 4 4 4"/></svg>
`;

/**
 * 创建减少缩进工具栏按钮 / Create outdent toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createOutdentToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: OUTDENT_ICON,
    tooltip: { text: i18n.t("toolbar.outdent"), keyboard: "shift + tab" },
    onClick: () => editor.commands.setOutdent(),
  });
}
