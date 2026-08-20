import { IndentSchema, OutdentFeature } from "../indent/extension";

import { createOutdentToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core/index";

/**
 * 减少缩进插件 / Outdent plugin
 */
export const OutdentPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "outdent",

  /**
   * 扩展实例（复用 Indent 扩展，提供 setOutdent 命令）
   * Extension instance (reuses Indent extension, provides setOutdent command)
   */
  schema: [IndentSchema],

  extensions: [OutdentFeature],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createOutdentToolbar,
};
