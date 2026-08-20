import { createFormatPainterToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core/index";

/**
 * 格式刷插件 / Format painter plugin
 */
export const FormatPainterPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "formatPainter",

  /**
   * 工具栏创建函数 / Toolbar creation function
   *
   * @param editor 编辑器实例 / Editor instance
   * @returns 工具栏按钮元素 / Toolbar button element
   */
  toolbar: createFormatPainterToolbar,
};
