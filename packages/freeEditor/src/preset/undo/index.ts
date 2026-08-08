import { History } from "./extensions/history";
import { UndoShortcut } from "./extensions/undo-shortcut";

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
   * schema 扩展：永久存在 / Schema extensions
   */
  schema: [History],

  /**
   * feature 扩展：可关闭功能 / Feature extensions
   */
  extensions: [UndoShortcut],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createUndoToolbar,
};


