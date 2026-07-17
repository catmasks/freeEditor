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
} from "./core/types/index";

import type { LocaleMessages } from "./core/i18n/index";

import type {
  FloatingToolbarItem,
  FloatingToolbarAPI,
} from "./preset/floatingToolbar/index";

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
