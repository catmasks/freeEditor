import { Bold } from "./extension";

import { createBoldToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 粗体插件 / Bold plugin
 */
export const BoldPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "fontBold",

  /**
   * 扩展实例 / Extension instance
   */
  extensions: Bold,

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createBoldToolbar,
};
