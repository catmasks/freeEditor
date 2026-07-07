import "./ui/styles/editor.scss";

import { Editor } from "./Editor";
import { i18n } from "./core/utils/index";

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
};
