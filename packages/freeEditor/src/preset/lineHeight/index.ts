import { LineHeight, LineHeightSchema } from "./extension";

import { createLineHeightToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 行高插件 / Line height plugin
 */
export const LineHeightPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "lineHeight",

  /**
   * 扩展实例数组 / Extension instance array
   */
  schema: [LineHeightSchema],

  extensions: [LineHeight],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createLineHeightToolbar,
};
