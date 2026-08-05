import { createClearFormatToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 清除格式插件 / Clear format plugin
 */
export const ClearFormatPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "clearFormat",

  /**
   * 工具栏创建函数 / Toolbar creation function
   *
   * @param editor 编辑器实例 / Editor instance
   * @returns 工具栏按钮元素 / Toolbar button element
   */
  toolbar: createClearFormatToolbar,
};
