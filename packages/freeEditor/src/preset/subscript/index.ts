import { Subscript, SubscriptSchema } from "./extension";

import { createSubscriptToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core/index";

/**
 * 下标插件 / Subscript plugin
 */
export const SubscriptPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "subscript",

  /**
   * 扩展实例 / Extension instance
   */
  schema: [SubscriptSchema],

  extensions: [Subscript],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createSubscriptToolbar,
};
