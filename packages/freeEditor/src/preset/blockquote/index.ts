import { Blockquote, BlockquoteSchema } from "./extension";

import { createBlockquoteToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 引用插件 / Blockquote plugin
 */
export const BlockquotePlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "blockquote",

  /**
   * 扩展实例 / Extension instance
   */
  schema: [BlockquoteSchema],

  extensions: [Blockquote],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createBlockquoteToolbar,
};
