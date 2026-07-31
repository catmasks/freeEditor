import { Superscript } from "./extension";

import { createSuperscriptToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 上标插件 / Superscript plugin
 */
export const SuperscriptPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "superscript",

  /**
   * 扩展实例 / Extension instance
   */
  extensions: Superscript,

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createSuperscriptToolbar,
};
