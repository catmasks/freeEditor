import { createFormatPainterToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 格式刷插件 / Format painter plugin
 *
 * 功能：
 * 1. 点击按钮捕获当前选区文本的格式（粗体、斜体、颜色、字体等）
 * 2. 进入"刷格式"模式，按钮高亮，光标变为画笔
 * 3. 选择目标文本后自动应用已捕获的格式
 * 4. 按 Escape 键退出刷格式模式
 *
 * Features:
 * 1. Click button to capture current text formatting (bold, italic, color, font, etc.)
 * 2. Enter "format painting" mode, button highlights, cursor changes to brush
 * 3. After selecting target text, automatically apply captured format
 * 4. Press Escape to exit format painting mode
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