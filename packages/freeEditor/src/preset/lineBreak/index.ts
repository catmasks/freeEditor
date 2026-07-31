import { LineBreak } from "./extension";

import { createLineBreakToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

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
  extensions: [LineBreak],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createLineBreakToolbar,
};
