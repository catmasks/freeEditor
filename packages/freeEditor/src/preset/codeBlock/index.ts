import { CustomCodeBlock } from "./extension";

import { createCodeBlockToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 代码块插件 / Code block plugin
 */
export const CodeBlockPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "codeBlock",

  /**
   * 扩展实例 / Extension instance
   */
  extensions: CustomCodeBlock,

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createCodeBlockToolbar,
};
