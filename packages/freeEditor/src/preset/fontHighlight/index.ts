import { CustomFontHighlight } from "./extension";

import { createFontHighlightToolbar } from "./toolbar";
import { Style, type EditorPlugin } from "../../core";

/**
 * 文本高亮插件 / Font highlight plugin
 */
export const FontHighlightPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "fontHighlight",

  /**
   * 扩展实例数组 / Extension instance array
   */
  extensions: [Style, CustomFontHighlight],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createFontHighlightToolbar,
};
