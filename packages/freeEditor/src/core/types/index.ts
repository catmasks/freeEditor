import type { EditorProps } from "@tiptap/pm/view";
import type { Editor, AnyExtension } from "@tiptap/core";
import type { MediaEngine } from "../utils/index";
export type { LocaleMessages } from "../i18n";

/**
 * 浮动工具栏放置位置 / Floating toolbar placement
 */
export type FloatingPlacement =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

/**
 * 悬浮工具栏项 / Floating toolbar item
 */
export interface FloatingToolbarItem {
  /**
   * 唯一标识 / Unique identifier
   */
  key: string;

  /**
   * 匹配规则 - 节点名称列表 / Match rule - node name list
   */
  matchNodes?: string[];

  /**
   * 匹配规则 - 标记名称列表 / Match rule - mark name list
   */
  matchMarks?: string[];

  /**
   * 自定义匹配函数 / Custom match function
   * @param editor 编辑器实例 / Editor instance
   * @returns 是否匹配 / Whether it matches
   */
  shouldShow?: (editor: Editor) => boolean;

  /**
   * 自定义目标获取函数 / Custom target getter function
   * 返回 HTMLElement 或 DOMRect 作为工具栏定位目标
   * Returns HTMLElement or DOMRect as toolbar positioning target
   * @param editor 编辑器实例 / Editor instance
   * @returns 目标元素或矩形 / Target element or rect
   */
  getTarget?: (editor: Editor) => HTMLElement | DOMRect | null;

  /**
   * 渲染工具栏内容 / Render toolbar content
   * @param editor 编辑器实例 / Editor instance
   * @returns 工具栏内容元素 / Toolbar content element
   */
  render: (editor: Editor) => HTMLElement;

  /**
   * 优先级，数值越大越靠前 / Priority, higher value comes first
   * @default 0
   */
  priority?: number;

  /**
   * 放置位置 / Placement position
   * @default "top-center"
   */
  placement?: FloatingPlacement;

  /**
   * 偏移量 / Offset value
   * @default 4
   */
  offset?: number;
}

/**
 * 悬浮工具栏 API / Floating toolbar API
 */
export interface FloatingToolbarAPI {
  /**
   * 注册工具栏项 / Register toolbar item
   * @param item 工具栏项 / Toolbar item
   * @returns 取消注册函数 / Unregister function
   */
  registerItem: (item: FloatingToolbarItem) => () => void;

  /**
   * 手动显示悬浮工具栏 / Manually show floating toolbar
   * @param target 目标元素或 DOMRect / Target element or DOMRect
   */
  show: (target: HTMLElement | DOMRect) => void;

  /**
   * 手动隐藏悬浮工具栏 / Manually hide floating toolbar
   */
  hide: () => void;

  /**
   * 刷新工具栏（重新匹配并渲染）/ Refresh toolbar (re-match and re-render)
   */
  refresh: () => void;

  /**
   * 获取当前是否可见 / Get whether it is currently visible
   */
  isVisible: () => boolean;

  /**
   * 销毁 / Destroy
   */
  destroy: () => void;
}

/**
 * 插件键名 / Plugin key
 */
export type EditorPluginKey =
  | "codeBlock"
  | "fontBold"
  | "fontItalic"
  | "fontColor"
  | "fontHighlight"
  | "fontFamily"
  | "fontSize"
  | "link"
  | "image"
  | "table"
  | "video"
  | "heading"
  | "attachment"
  | "floatingToolbar";
/**
 * 语言类型 / Locale type
 */
export type Locale = "zh-CN" | "en" | "ja-JP";

/**
 * 编辑器选项 / Editor options
 */
export interface EditorOptions {
  /**
   * 初始化内容 / Initial content
   */
  content?: string;

  /**
   * 主题 / Theme
   */
  theme?: EditorTheme;

  /**
   * 语言 / Locale
   */
  locale?: Locale;

  /**
   * 占位符文本 / Placeholder text
   */
  placeholder?: string;

  /**
   * 包含的插件 / Included plugins
   */
  include?: EditorPluginKey[];

  /**
   * 排除的插件 / Excluded plugins
   */
  exclude?: EditorPluginKey[];

  /**
   * 上传配置 / Upload configuration
   */
  uploader?: MediaUploaderOptions;
}

/**
 * 编辑器配置（内部使用） / Editor configuration (internal use)
 */
export interface EditorConfig {
  /**
   * 内容 / Content
   */
  content?: string;

  /**
   * 扩展 / Extensions
   */
  extensions?: AnyExtension[];

  /**
   * 编辑器属性 / Editor properties
   */
  editorProps?: EditorProps;
}

/**
 * 编辑器主题 / Editor theme
 */
export type EditorTheme = "light" | "dark";

/**
 * 媒体类型 / Media type
 */
export type MediaType = "image" | "video" | "attachment";

/**
 * 上传进度信息 / Upload progress information
 */
export interface UploadProgress {
  /**
   * 已加载字节数 / Loaded bytes
   */
  loaded: number;

  /**
   * 总字节数 / Total bytes
   */
  total: number;

  /**
   * 百分比 / Percentage
   */
  percent: number;
}

/**
 * 上传结果 / Upload result
 */
export interface UploadResult {
  /**
   * 资源 URL / Resource URL
   */
  url: string;

  /**
   * 文件名称 / File name
   */
  name?: string;
}

/**
 * 上传上下文 / Upload context
 */
export interface UploadContext {
  /**
   * 进度回调 / Progress callback
   */
  onProgress?: (progress: UploadProgress) => void;

  /**
   * 中止信号 / Abort signal
   */
  signal?: AbortSignal;

  /**
   * 上传配置 / Upload configuration
   */
  config: MediaUploaderConfig;
}

/**
 * 上传任务状态 / Upload task status
 */
export type UploadTaskStatus =
  | "idle"
  | "uploading"
  | "success"
  | "error"
  | "canceled";

/**
 * 上传任务 / Upload task
 */
export interface UploadTask {
  /**
   * 任务 ID / Task ID
   */
  id: string;

  /**
   * 文件对象 / File object
   */
  file: File;

  /**
   * 媒体类型 / Media type
   */
  type: MediaType;

  /**
   * 上传进度 / Upload progress
   */
  progress: number;

  /**
   * 任务状态 / Task status
   */
  status: UploadTaskStatus;

  /**
   * 上传响应 / Upload response
   */
  response?: UploadResult;

  /**
   * 错误信息 / Error information
   */
  error?: Error;

  /**
   * 开始上传 / Start upload
   * @returns Promise 对象 / Promise object
   */
  start(): Promise<void>;

  /**
   * 重试上传 / Retry upload
   * @returns Promise 对象 / Promise object
   */
  retry(): Promise<void>;

  /**
   * 取消上传 / Cancel upload
   */
  cancel(): void;
}

/**
 * 媒体上传配置 / Media upload configuration
 */
export interface MediaUploaderConfig {
  /**
   * 上传地址 / Upload URL
   */
  action?: string;

  /**
   * 请求方法 / Request method
   */
  method?: string;

  /**
   * 请求头 / Request headers
   */
  headers?: HeadersInit;

  /**
   * 是否携带凭证 / Whether to carry credentials
   */
  withCredentials?: boolean;

  /**
   * 表单字段名 / Form field name
   */
  fieldName?: string;

  /**
   * 最大文件大小 / Maximum file size
   */
  maxSize?: number;

  /**
   * 接受的文件类型 / Accepted file types
   */
  accept?: string[];

  /**
   * 额外的表单数据 / Extra form data
   */
  data?: Record<string, any> | (() => Record<string, any>);

  /**
   * 格式化响应结果 / Format response result
   * @param result 响应结果 / Response result
   * @returns 格式化后的上传结果 / Formatted upload result
   */
  format?: (result: any) => UploadResult | Promise<UploadResult>;

  /**
   * 自定义上传函数 / Custom upload function
   * @param file 文件对象 / File object
   * @param context 上传上下文 / Upload context
   * @returns 上传结果 / Upload result
   */
  upload?: (file: File, context: UploadContext) => Promise<UploadResult>;

  /**
   * 上传前钩子 / Pre-upload hook
   * @param file 文件对象 / File object
   * @returns 处理后的文件或 false 取消上传 / Processed file or false to cancel
   */
  beforeUpload?: (file: File) => File | false | Promise<File | false>;

  /**
   * 验证文件 / Validate file
   * @param file 文件对象 / File object
   * @returns 错误信息或 undefined / Error message or undefined
   */
  validate?: (file: File) => string | void;

  /**
   * 进度回调 / Progress callback
   * @param progress 进度信息 / Progress information
   * @param file 文件对象 / File object
   */
  onProgress?: (progress: UploadProgress, file: File) => void;

  /**
   * 成功回调 / Success callback
   * @param result 上传结果 / Upload result
   * @param file 文件对象 / File object
   */
  onSuccess?: (result: UploadResult, file: File) => void;

  /**
   * 上传错误回调 / Upload error callback
   * @param error 错误对象 / Error object
   * @param file 文件对象 / File object
   */
  onUploadError?: (error: Error, file: File) => void;

  /**
   * 类型错误回调 / Type error callback
   * @param error 错误对象 / Error object
   * @param file 文件对象 / File object
   */
  onTypeError?: (error: Error, file: File) => void;

  /**
   * 大小错误回调 / Size error callback
   * @param error 错误对象 / Error object
   * @param file 文件对象 / File object
   */
  onSizeError?: (error: Error, file: File) => void;

  /**
   * 验证错误回调 / Validation error callback
   * @param error 错误对象 / Error object
   * @param file 文件对象 / File object
   */
  onValidateError?: (error: Error, file: File) => void;
}

/**
 * 多媒体上传配置集合 / Media upload configuration collection
 */
export interface MediaUploaderOptions {
  /**
   * 图片上传配置 / Image upload configuration
   */
  image?: MediaUploaderConfig;

  /**
   * 视频上传配置 / Video upload configuration
   */
  video?: MediaUploaderConfig;

  /**
   * 文件上传配置 / File upload configuration
   */
  attachment?: MediaUploaderConfig;
}

/**
 * 插入媒体参数 / Insert media options
 */
export interface InsertOptions {
  /**
   * 节点 ID / Node ID
   */
  id: string;

  /**
   * 媒体类型 / Media type
   */
  type: MediaType;

  /**
   * 资源地址 / Resource URL
   */
  src?: string;

  /**
   * 文件名称 / File name
   */
  name?: string;

  /**
   * 文件大小（字节） / File size (bytes)
   */
  size?: number;

  /**
   * 是否加载中 / Whether loading
   */
  loading?: boolean;

  /**
   * 上传进度 / Upload progress
   */
  progress?: number;

  /**
   * 是否出错 / Whether error occurred
   */
  error?: boolean;

  /**
   * 任务 ID / Task ID
   */
  taskId?: string;
}

/**
 * 上传生成器 / Upload generator
 */
export type UploadGenerator = {
  /**
   * 上传文件 / Upload file
   * @param file 文件对象 / File object
   * @param type 媒体类型 / Media type
   * @returns 上传任务或 undefined / Upload task or undefined
   */
  upload(file: File, type: MediaType): Promise<UploadTask | undefined>;

  /**
   * 重试上传 / Retry upload
   * @param taskId 任务 ID / Task ID
   */
  retry(taskId: string): void;

  /**
   * 取消上传 / Cancel upload
   * @param taskId 任务 ID / Task ID
   */
  cancel(taskId: string): void;

  /**
   * 获取任务 / Get task
   * @param id 任务 ID / Task ID
   * @returns 上传任务或 undefined / Upload task or undefined
   */
  getTask(id: string): UploadTask | undefined;
};

/**
 * 插件上下文 / Plugin context
 */
export interface EditorPluginContext {
  /**
   * 上传配置 / Upload configuration
   */
  uploader?: MediaUploaderOptions;

  /**
   * 媒体引擎 / Media engine
   */
  mediaEngine?: MediaEngine | null;
}

/**
 * 编辑器插件 / Editor plugin
 */
export interface EditorPlugin {
  /**
   * 插件键名 / Plugin key
   */
  key: EditorPluginKey;

  /**
   * 工具栏渲染函数 / Toolbar render function
   * @param editor 编辑器实例 / Editor instance
   * @returns 工具栏元素 / Toolbar element
   */
  toolbar?: (editor: Editor) => HTMLElement;

  /**
   * 扩展 / Extensions
   */
  extensions?: AnyExtension | AnyExtension[];

  /**
   * 编辑器属性 / Editor properties
   */
  editorProps?: EditorProps;

  /**
   * 设置插件 / Setup plugin
   * @param editor 编辑器实例 / Editor instance
   * @param context 插件上下文 / Plugin context
   * @returns 清理函数或 void / Cleanup function or void
   */
  setup?: (editor: Editor, context: EditorPluginContext) => void | (() => void);
}

/**
 * 创建插件结果 / Create plugins result
 */
export interface CreateEditorPluginsResult {
  /**
   * 扩展数组 / Extensions array
   */
  extensions: AnyExtension[];

  /**
   * 工具栏插件数组 / Toolbar plugins array
   */
  toolbars: EditorPlugin[];

  /**
   * 编辑器属性 / Editor properties
   */
  editorProps: EditorProps;

  /**
   * 设置函数 / Setup function
   * @param editor 编辑器实例 / Editor instance
   * @param root 根容器元素 / Root container element
   * @returns 清理函数 / Cleanup function
   */
  setup: (editor: Editor, root?: HTMLElement) => () => void;
}

/**
 * 创建插件选项 / Create plugins options
 */
export interface CreateEditorPluginsOptions {
  /**
   * 包含的插件 / Included plugins
   */
  include?: string[];

  /**
   * 排除的插件 / Excluded plugins
   */
  exclude?: string[];

  /**
   * 上传配置 / Upload configuration
   */
  uploader?: any;

  /**
   * 占位符文本 / Placeholder text
   */
  placeholder?: string;
}
