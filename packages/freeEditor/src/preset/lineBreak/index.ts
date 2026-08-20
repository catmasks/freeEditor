import { LineBreak, LineBreakSchema } from "./extension";

import { createLineBreakToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core/index";

/**
 * 软换行插件 / Line break plugin
 */
export const LineBreakPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "lineBreak",

  /**
   * 扩展实例 / Extension instance
   */
  schema: [LineBreakSchema],

  extensions: [LineBreak],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createLineBreakToolbar,
};
