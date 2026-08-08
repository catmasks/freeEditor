/**
 * ImportWord 插件入口
 */

import type { EditorPlugin } from "../../core";
import { ImportWord } from "./extension";
import { createImportWordToolbar } from "./toolbar";

/**
 * 导入 Word 插件
 */
export const ImportWordPlugin: EditorPlugin = {
  key: "importWord",
  extensions: [ImportWord],
  toolbar: createImportWordToolbar,
};
