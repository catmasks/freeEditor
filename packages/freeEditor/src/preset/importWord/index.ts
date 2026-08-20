import type { EditorPlugin } from "../../core/index";
import { UploadPlaceholder, UploadPlaceholderSchema } from "../../core/index";
import { ImportWord } from "./extension";
import { createImportWordToolbar } from "./toolbar";

/**
 * 导入 Word 插件
 */
export const ImportWordPlugin: EditorPlugin = {
  key: "importWord",
  schema: [UploadPlaceholderSchema],
  extensions: [UploadPlaceholder, ImportWord],
  toolbar: createImportWordToolbar,
};
