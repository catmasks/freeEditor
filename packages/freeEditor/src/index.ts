import "./ui/styles/editor.scss";
import { i18n, Editor } from "./core/index";
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

/**
 * 编辑器核心类，用于创建编辑器实例
 * Core editor class for creating and managing the editor instance.
 */
export { Editor };

/**
 * 国际化（i18n）工具实例，支持多语言切换和扩展
 * Internationalization (i18n) utility instance for language switching and extension.
 */
export { i18n };

/** 编辑器配置项 / Complete configuration options for the editor. */
export type { EditorOptions };

/** 编辑器主题配置 / Theme configuration (colors, fonts, etc.). */
export type { EditorTheme };

/** 插件注册用的唯一标识符 / Unique identifier used when registering plugins. */
export type { EditorPluginKey };

/** 媒体上传器的配置选项 / Configuration options for instantiating the media uploader. */
export type { MediaUploaderOptions };

/** 媒体上传器的原始配置 / Low-level configuration for the media uploader. */
export type { MediaUploaderConfig };

/** 单个文件上传的最终结果 / Final result of a single file upload. */
export type { UploadResult };

/** 上传时的上下文信息 / Contextual information about the upload. */
export type { UploadContext };

/** 上传进度事件（已上传字节数、总大小、百分比）/ Upload progress event. */
export type { UploadProgress };

/** 上传任务（可控制暂停/取消）/ Upload task that can be paused or cancelled. */
export type { UploadTask };

/** 上传任务的状态枚举 / Status enum of an upload task. */
export type { UploadTaskStatus };

/** 支持的媒体文件类型（'image' | 'video' | 'attachment'）/ Supported media types. */
export type { MediaType };

/** 支持的语言代码（如 'zh-CN'、'en'、'ja-JP'）/ Supported language codes. */
export type { Locale };

/** 语言包的消息结构 / Message structure for a locale pack. */
export type { LocaleMessages };
