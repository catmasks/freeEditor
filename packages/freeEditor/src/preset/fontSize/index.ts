import { CustomFontSize, CustomFontSizeSchema } from "./extension";

import { createFontSizeToolbar } from "./toolbar";
import { Style, type EditorPlugin } from "../../core/index";

/**
 * 字号插件 / Font size plugin
 */
export const FontSizePlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "fontSize",

  /**
   * 扩展实例数组 / Extension instance array
   */
  schema: [Style, CustomFontSizeSchema],

  extensions: [CustomFontSize],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createFontSizeToolbar,
};
