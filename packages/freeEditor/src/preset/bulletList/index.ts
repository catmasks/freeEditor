import { BulletList } from "./extension";

import { createBulletListToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

/**
 * 无序列表插件 / Bullet list plugin
 */
export const BulletListPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "bulletList",

  /**
   * 扩展实例 / Extension instance
   */
  extensions: BulletList,

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createBulletListToolbar,
};

export { BulletList, createBulletListToolbar };
