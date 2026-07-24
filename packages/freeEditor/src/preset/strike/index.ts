import { Strike } from "./extension";

import { createStrikeToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 删除线插件 / Strike plugin
 */
export const StrikePlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "strike",

  /**
   * 扩展实例 / Extension instance
   */
  extensions: Strike,

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createStrikeToolbar,
};
