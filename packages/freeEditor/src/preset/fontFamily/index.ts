import { CustomFontFamily, CustomFontFamilySchema } from "./extension";

import { createFontFamilyToolbar } from "./toolbar";
import { Style, type EditorPlugin } from "../../core/index";

/**
 * 字体插件 / Font family plugin
 */
export const FontFamilyPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "fontFamily",

  /**
   * 扩展实例数组 / Extension instance array
   */
  schema: [Style, CustomFontFamilySchema],

  extensions: [CustomFontFamily],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createFontFamilyToolbar,
};
