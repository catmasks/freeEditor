import { CustomLink } from "./extension";

import { createLinkToolbar } from "./toolbar";
import { type EditorPlugin } from "../../core";

/**
 * 链接插件 / Link plugin
 */
export const LinkPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "link",

  /**
   * 扩展实例（配置关闭点击打开链接）/ Extension instance (configured to disable click-to-open)
   */
  extensions: CustomLink.configure({
    openOnClick: false,
  }),

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createLinkToolbar,
};
