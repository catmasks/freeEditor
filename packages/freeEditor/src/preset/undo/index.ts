import { History } from "./extension";

import { createUndoToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 撤销插件 / Undo plugin
 */
export const UndoPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "undo",

  /**
   * 扩展实例 / Extension instance
   */
  extensions: [History],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createUndoToolbar,
};

export { History } from "./extension";