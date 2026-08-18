import "./ui/styles/editor.scss";

import { Editor } from "./Editor";
import { i18n } from "./core/index";

import type {
  EditorOptions,
  EditorTheme,
  EditorPluginKey,
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
} from "./core/index";

/* 编辑器核心 */
export { Editor, i18n };
/** 编辑器类型 */
export type {
  EditorOptions,
  EditorTheme,
  EditorPluginKey,
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
};
