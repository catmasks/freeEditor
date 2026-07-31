import { TaskList } from "./extension";

import { createTaskListToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 任务列表插件 / Task list plugin
 */
export const TaskListPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "taskList",

  /**
   * 扩展实例 / Extension instance
   */
  extensions: TaskList,

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createTaskListToolbar,
};

export { TaskList, createTaskListToolbar };
