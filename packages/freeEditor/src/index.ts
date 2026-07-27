import "./ui/styles/editor.scss";

import { Editor } from "./Editor";
import { i18n } from "./core/index";

import type {
  EditorOptions,
  EditorTheme,
  EditorPluginKey,
  EditorPlugin,
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
} from "./core/index";

export { Editor, i18n };

export type {
  EditorOptions,
  EditorTheme,
  EditorPluginKey,
  EditorPlugin,
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
};
