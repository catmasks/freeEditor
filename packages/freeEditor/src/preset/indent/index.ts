import { Indent } from "./extension";

import { createIndentToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 增加缩进插件 / Indent plugin
 */
export const IndentPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "indent",

  /**
   * 扩展实例 / Extension instance
   */
  extensions: [Indent],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createIndentToolbar,
};
