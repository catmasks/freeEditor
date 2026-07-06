import { CustomHeading } from "./extension";

import { createHeadingToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 标题插件 / Heading plugin
 */
export const HeadingPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "heading",

  /**
   * 扩展实例 / Extension instance
   */
  extensions: CustomHeading,

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createHeadingToolbar,
};
