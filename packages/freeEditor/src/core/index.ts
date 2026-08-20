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
  UploadGenerator,
} from "./types/index";

export { i18n } from "./i18n";
export { Editor } from "./Editor";
export { editorRuntimeState } from "./editorRuntimeState";
export {
  isEmptyDocument,
  downloadFile,
  isNonContentTransaction,
  MediaNodeViewRenderer,
  ensureEditorFocus,
  handleUploadFiles,
  useMediaUploader,
  Style,
  UploadPlaceholder,
  UploadPlaceholderSchema,
} from "./utils";
