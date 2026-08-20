import { OrderedList, OrderedListSchema } from "./extension";

import { createOrderedListToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core/index";

/**
 * 有序列表插件 / Ordered list plugin
 */
export const OrderedListPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "orderedList",

  /**
   * 扩展实例 / Extension instance
   */
  schema: [OrderedListSchema],

  extensions: [OrderedList],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createOrderedListToolbar,
};
