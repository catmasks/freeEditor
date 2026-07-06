import { Italic } from "./extension";

import { createItalicToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 斜体插件 / Italic plugin
 */
export const ItalicPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "fontItalic",

  /**
   * 扩展实例 / Extension instance
   */
  extensions: Italic,

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createItalicToolbar,
};
