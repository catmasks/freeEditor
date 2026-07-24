import { Underline } from "./extension";

import { createUnderlineToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 下划线插件 / Underline plugin
 */
export const UnderlinePlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "underline",

  /**
   * 扩展实例 / Extension instance
   */
  extensions: Underline,

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createUnderlineToolbar,
};
