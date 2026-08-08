import { Divider, DividerSchema } from "./extension";

import { createDividerToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 分割线插件 / Divider plugin
 */
export const DividerPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "divider",

  /**
   * 扩展实例 / Extension instance
   */
  schema: [DividerSchema],

  extensions: [Divider],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createDividerToolbar,
};


