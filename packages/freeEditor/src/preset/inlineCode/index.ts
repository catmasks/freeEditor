import { InlineCode, InlineCodeSchema } from "./extension";

import { createInlineCodeToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 行内代码插件 / Inline code plugin
 */
export const InlineCodePlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "inlineCode",

  /**
   * 扩展实例 / Extension instance
   */
  schema: [InlineCodeSchema],

  extensions: [InlineCode],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createInlineCodeToolbar,
};
