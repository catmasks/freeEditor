import { History } from "../undo/extension";

import { createRedoToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core/index";

/**
 * 重做插件 / Redo plugin
 */
export const RedoPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "redo",

  /**
   * 扩展实例（复用 History 扩展，提供 redo 命令）
   * Extension instance (reuses History extension, provides redo command)
   */
  schema: [History],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createRedoToolbar,
};
