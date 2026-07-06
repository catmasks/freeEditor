import { CustomFontColor } from "./extension";

import { createFontColorToolbar } from "./toolbar";
import { Style, type EditorPlugin } from "../../core";

/**
 * 字体颜色插件 / Font color plugin
 */
export const FontColorPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "fontColor",

  /**
   * 扩展实例数组 / Extension instance array
   */
  extensions: [Style, CustomFontColor],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createFontColorToolbar,
};
