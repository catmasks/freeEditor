import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 任务列表图标 SVG / Task list icon SVG
 */
const TASK_LIST_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><path d="M14 4h7"/><path d="M14 9h7"/><path d="M14 15h7"/><path d="M14 20h7"/></svg>
`;

/**
 * 创建任务列表工具栏按钮 / Create task list toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createTaskListToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: TASK_LIST_ICON,
    tooltip: {
      text: i18n.t("toolbar.taskList"),
      keyboard: "ctrl + shift + 9",
    },
    isActive: () => editor.isActive("taskList"),
    onClick: () => editor.commands.toggleTaskList(),
  });
}
