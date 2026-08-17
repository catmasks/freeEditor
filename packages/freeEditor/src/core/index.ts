/**
 * 编辑器核心模块导出 / Editor core module exports
 *
 * 仅导出内部模块和对外 API 需要的内容
 */

export type {
  EditorOptions,
  EditorTheme,
  EditorPluginKey,
  EditorPlugin,
  EditorPluginContext,
  MediaUploaderOptions,
  MediaUploaderConfig,
  UploadResult,
  UploadContext,
  UploadProgress,
  UploadTask,
  UploadTaskStatus,
  MediaType,
  Locale,
  LocaleMessages,
  FloatingToolbarItem,
  FloatingToolbarAPI,
  FloatingPlacement,
} from "./types/index";

export { i18n } from "./i18n";

export { ensureEditorFocus } from "./utils/editor";
export { Style } from "./utils/style";
export { MediaNodeViewRenderer } from "./utils/MediaNodeViewRenderer/MediaNodeViewRenderer";
export {
  UploadPlaceholder,
  UploadPlaceholderSchema,
} from "./utils/uploadNode/UploadPlaceholder";
export { isEmptyDocument, downloadFile } from "./utils/export";

export { handleUploadFiles, useMediaUploader } from "./utils/useMediaUploader";
