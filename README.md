# Free Editor 使用文档

> 基于 Tiptap 的轻量级富文本编辑器

---

## 1. 快速开始

### 1.1 安装

```bash
npm install @cat/free-editor
```

### 1.2 基础用法

```typescript
import { Editor } from "@cat/free-editor";
import "@cat/free-editor/style.css";

// 创建编辑器
const editor = new Editor(document.getElementById("editor"), {
  content: "<p>Hello World</p>",
  theme: "light",
});

  placeholder: "请输入内容...",
});
```

### 1.3 完整示例

```typescript
import { Editor } from "@cat/free-editor";
import "@cat/free-editor/style.css";

const container = document.getElementById("editor-container");

const editor = new Editor(container, {
  // 初始内容
  content: "<h1>标题</h1><p>这是一段<strong>粗体</strong>文本</p>",

  // 主题
  theme: "light",

  // 占位符
  placeholder: "开始输入内容...",

  // 只包含指定插件
  include: ["heading", "fontBold", "fontItalic", "link"],

  // 排除指定插件
  exclude: ["codeBlock"],

  // 上传配置
  uploader: {
    image: {
      action: "/api/upload",
      fieldName: "file",
      onSuccess: (result) => {
        console.log("上传成功:", result);
      },
    },
  },
});

// 获取 HTML
const html = editor.getHtml();
console.log(html);

// 切换主题
editor.toggleTheme();

// 销毁编辑器
// editor.destroy();
```

---

## 2. 核心类 Editor

### 2.1 Editor 构造函数

**函数签名：**

```typescript
constructor(el: HTMLElement, options?: EditorOptions)
```

**参数：**

| 参数      | 类型            | 说明                   |
| --------- | --------------- | ---------------------- |
| `el`      | `HTMLElement`   | 编辑器挂载的 DOM 元素  |
| `options` | `EditorOptions` | 编辑器配置选项（可选） |

**使用示例：**

```typescript
const editor = new Editor(document.getElementById("editor"), {
  content: "<p>初始内容</p>",
  theme: "light",
});
```

### 2.2 实例属性

#### `isMounted`

```typescript
get isMounted(): boolean
```

获取编辑器是否已挂载。

```typescript
console.log(editor.isMounted); // true
```

#### `isDestroyed`

```typescript
get isDestroyed(): boolean
```

获取编辑器是否已销毁。

```typescript
console.log(editor.isDestroyed); // false
```

#### `theme`

```typescript
get theme(): EditorTheme
```

获取当前主题。返回 `"light"` 或 `"dark"`。

```typescript
console.log(editor.theme); // "light"
```

#### `isDark`

```typescript
get isDark(): boolean
```

是否为深色模式。

```typescript
console.log(editor.isDark); // false
```

### 2.3 实例方法

#### `setTheme(theme)`

```typescript
setTheme(theme: EditorTheme): void
```

设置主题。

**参数：**

| 参数    | 类型          | 说明                            |
| ------- | ------------- | ------------------------------- |
| `theme` | `EditorTheme` | 主题名称，`"light"` 或 `"dark"` |

**示例：**

```typescript
editor.setTheme("dark");
```

---

#### `toggleTheme()`

```typescript
toggleTheme(): void
```

切换主题（亮色/深色）。

**示例：**

```typescript
editor.toggleTheme();
```

---

#### `getHtml()`

```typescript
getHtml(): string
```

获取编辑器 HTML 内容。

**返回值：** `string` - HTML 字符串

**抛出：** 如果编辑器已销毁，抛出 `Error: Editor has been destroyed`

**示例：**

```typescript
const html = editor.getHtml();
console.log(html);
```

---

#### `destroy()`

```typescript
destroy(): void
```

销毁编辑器，清理所有资源和事件监听。

**示例：**

```typescript
editor.destroy();
```

---

## 3. 配置项 EditorOptions

### 3.1 基础配置

#### `content`

```typescript
content?: string
```

编辑器初始化内容，HTML 字符串。

**默认值：** `undefined`

**示例：**

```typescript
const editor = new Editor(el, {
  content: "<h1>Hello</h1><p>欢迎使用编辑器</p>",
});
```

---

#### `theme`

```typescript
theme?: EditorTheme
```

编辑器主题。

**默认值：** `"light"`

**可选值：** `"light"` | `"dark"`

**示例：**

```typescript
const editor = new Editor(el, {
  theme: "dark",
});
```

---

#### `placeholder`

```typescript
placeholder?: string
```

占位符文本，编辑器为空时显示。

**默认值：** `"请输入内容..."`

**示例：**

```typescript
const editor = new Editor(el, {
  placeholder: "开始写作吧...",
});
```

---

### 3.2 插件配置

#### `include`

```typescript
include?: EditorPluginKey[]
```

只包含指定的插件。为空时包含所有插件）。

**默认值：** `[]`（包含所有插件）

**示例：**

```typescript
const editor = new Editor(el, {
  include: ["heading", "fontBold", "fontItalic", "link", "image"],
});
```

---

#### `exclude`

```typescript
exclude?: EditorPluginKey[]
```

排除指定的插件。

**默认值：** `[]`（不排除任何插件）

**示例：**

```typescript
const editor = new Editor(el, {
  exclude: ["codeBlock", "video"],
});
```

---

### 3.3 上传配置

#### `uploader`

```typescript
uploader?: MediaUploaderOptions
```

媒体上传配置，支持图片、视频、文件三种类型的独立配置。

**示例：**

```typescript
const editor = new Editor(el, {
  uploader: {
    image: {
      action: "/api/upload/image",
      fieldName: "file",
      maxSize: 5 * 1024 * 1024, // 5MB
      accept: ["image/*"],
    },
    video: {
      action: "/api/upload/video",
      fieldName: "file",
      maxSize: 50 * 1024 * 1024, // 50MB
    },
  },
});
```

详细配置说明请参考 [第 5 章](#5-媒体上传)。

---

## 4. 插件系统

### 4.1 插件列表

编辑器内置以下插件：

| 插件键名        | 名称     | 说明                        |
| --------------- | -------- | --------------------------- |
| `heading`       | 标题     | 支持 H1-H6 标题             |
| `fontBold`      | 粗体     | 文字加粗/取消加粗           |
| `fontItalic`    | 斜体     | 文字倾斜/取消倾斜           |
| `fontColor`     | 字体颜色 | 设置文字颜色                |
| `fontHighlight` | 高亮     | 设置文字背景高亮            |
| `fontFamily`    | 字体     | 设置字体                    |
| `fontSize`      | 字号     | 设置文字大小                |
| `link`          | 链接     | 插入/编辑/移除链接          |
| `codeBlock`     | 代码块   | 插入代码块                  |
| `image`         | 图片     | 插入图片，支持拖拽/粘贴上传 |
| `video`         | 视频     | 插入视频，支持拖拽/粘贴上传 |

> 基础插件（始终包含：文档、段落、文本、占位符、光标间隙。

### 4.2 插件键名 EditorPluginKey

```typescript
type EditorPluginKey =
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
  | "heading";
```

### 4.3 包含/排除插件

#### 只包含指定插件：

```typescript
const editor = new Editor(el, {
  include: ["heading", "fontBold", "fontItalic"],
});
```

#### 排除指定插件：

```typescript
const editor = new Editor(el, {
  exclude: ["codeBlock", "video"],
});
```

> 优先级：`include` 优先于 `exclude`。如果设置了 `include`，`exclude` 无效。

### 4.4 EditorPlugin 接口

插件接口定义：

```typescript
interface EditorPlugin {
  key: EditorPluginKey;
  toolbar?: (editor: Editor) => HTMLElement;
  extensions?: AnyExtension | AnyExtension[];
  editorProps?: EditorProps;
  setup?: (editor: Editor, context: EditorPluginContext) => void | (() => void);
}
```

**属性说明：**

| 属性          | 类型                                        | 说明                         |
| ------------- | ------------------------------------------- | ---------------------------- |
| `key`         | `EditorPluginKey`                           | 插件唯一标识                 |
| `toolbar`     | `(editor: Editor) => HTMLElement`           | 工具栏渲染函数               |
| `extensions`  | `AnyExtension \| AnyExtension[]`            | Tiptap 扩展                  |
| `editorProps` | `EditorProps`                               | 编辑器属性                   |
| `setup`       | `(editor, context) => void \| (() => void)` | 插件初始化函数，返回清理函数 |

---

## 5. 媒体上传

### 5.1 MediaUploaderOptions

上传配置集合，按媒体类型分别配置。

```typescript
interface MediaUploaderOptions {
  image?: MediaUploaderConfig;
  video?: MediaUploaderConfig;
  file?: MediaUploaderConfig;
}
```

**属性说明：**

| 属性    | 类型                  | 说明         |
| ------- | --------------------- | ------------ |
| `image` | `MediaUploaderConfig` | 图片上传配置 |
| `video` | `MediaUploaderConfig` | 视频上传配置 |
| `file`  | `MediaUploaderConfig` | 文件上传配置 |

---

### 5.2 MediaUploaderConfig

单个媒体类型的上传配置。

#### `action`

```typescript
action?: string
```

上传地址 URL。

**默认值：** `undefined`

---

#### `method`

```typescript
method?: string
```

请求方法。

**默认值：** `"POST"`

---

#### `headers`

```typescript
headers?: HeadersInit
```

请求头。

**示例：**

```typescript
{
  headers: {
    Authorization: "Bearer token123",
  },
}
```

---

#### `withCredentials`

```typescript
withCredentials?: boolean
```

是否携带凭证（Cookie等）。

**默认值：** `false`

---

#### `fieldName`

```typescript
fieldName?: string
```

表单字段名。

**默认值：** `"file"`

---

#### `maxSize`

```typescript
maxSize?: number
```

最大文件大小（字节）。

**默认值：** `Infinity`

**示例：**

```typescript
{
  maxSize: 5 * 1024 * 1024, // 5MB
}
```

---

#### `accept`

```typescript
accept?: string[]
```

接受的文件类型。

**默认值：** `[]`

**示例：**

```typescript
{
  accept: ["image/*", ".png", ".jpg"],
}
```

---

#### `data`

```typescript
data?: Record<string, any> | (() => Record<string, any>)
```

额外的表单数据。

**示例：**

```typescript
{
  data: {
    type: "avatar",
  },
  // 或函数形式
  data: () => ({
    timestamp: Date.now(),
  }),
}
```

---

#### `format`

```typescript
format?: (result: any) => UploadResult | Promise<UploadResult>
```

格式化响应结果。

**参数：**

- `result` - 服务器响应结果

**返回值：** `UploadResult` - 格式化后的上传结果

**示例：**

```typescript
{
  format: (response) => ({
    url: response.data.url,
    name: response.data.filename,
  }),
}
```

---

#### `upload`

```typescript
upload?: (file: File, context: UploadContext) => Promise<UploadResult>
```

自定义上传函数。设置此函数后，默认上传逻辑将被替换。

**参数：**

- `file` - 文件对象
- `context` - 上传上下文，包含 `signal`、`config`、`onProgress`

**返回值：** `Promise<UploadResult>` - 上传结果

**示例：**

```typescript
{
  upload: async (file, context) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      signal: context.signal,
    });

    const data = await res.json();

    context.onProgress?.({ percent: 100, loaded: 100, total: 100 });

    return {
      url: data.url,
      name: data.name,
    };
  },
}
```

---

#### `beforeUpload`

```typescript
beforeUpload?: (file: File) => File | false | Promise<File | false>
```

上传前钩子。返回 `false` 取消上传，返回新 `File` 对象替换文件。

**示例：**

```typescript
{
  beforeUpload: (file) => {
    // 压缩图片后返回
    return compressImage(file);
  },
}
```

---

#### `validate`

```typescript
validate?: (file: File) => string | void
```

验证文件。返回错误信息字符串表示验证失败。

**示例：**

```typescript
{
  validate: (file) => {
    if (file.size > 10 * 1024 * 1024) {
      return "文件不能超过 10MB";
    }
  },
}
```

---

#### `onProgress`

```typescript
onProgress?: (progress: UploadProgress, file: File) => void
```

进度回调。

---

#### `onSuccess`

```typescript
onSuccess?: (result: UploadResult, file: File) => void
```

成功回调。

---

#### `onUploadError`

```typescript
onUploadError?: (error: Error, file: File) => void
```

上传错误回调。

---

#### `onTypeError`

```typescript
onTypeError?: (error: Error, file: File) => void
```

文件类型错误回调。

---

#### `onSizeError`

```typescript
onSizeError?: (error: Error, file: File) => void
```

文件大小错误回调。

---

#### `onValidateError`

```typescript
onValidateError?: (error: Error, file: File) => void
```

验证错误回调。

---

### 5.3 UploadTask 上传任务

上传任务对象，代表一个正在进行的上传。

#### 属性

| 属性       | 类型               | 说明                   |
| ---------- | ------------------ | ---------------------- |
| `id`       | `string`           | 任务 ID                |
| `file`     | `File`             | 文件对象               |
| `type`     | `MediaType`        | 媒体类型               |
| `progress` | `number`           | 上传进度（0-100）      |
| `status`   | `UploadTaskStatus` | 任务状态               |
| `response` | `UploadResult?`    | 上传响应（成功后有值） |
| `error`    | `Error?`           | 错误信息（失败后有值） |

#### 状态 UploadTaskStatus

```typescript
type UploadTaskStatus = "idle" | "uploading" | "success" | "error" | "canceled";
```

#### 方法

##### `start()`

```typescript
start(): Promise<void>
```

开始上传。

##### `retry()`

```typescript
retry(): Promise<void>
```

重试上传。

##### `cancel()`

```typescript
cancel(): void
```

取消上传。

---

### 5.4 上传示例

#### 基础上传配置

```typescript
import { Editor } from "@cat/free-editor";
import "@cat/free-editor/style.css";

const editor = new Editor(el, {
  uploader: {
    image: {
      action: "/api/upload/image",
      fieldName: "file",
      maxSize: 5 * 1024 * 1024, // 5MB
      accept: ["image/png", "image/jpeg", "image/gif"],
      onSuccess: (result, file) => {
        console.log("图片上传成功:", result.url);
      },
      onUploadError: (error, file) => {
        console.error("上传失败:", error.message);
      },
    },
  },
});
```

#### 自定义上传函数

```typescript
const editor = new Editor(el, {
  uploader: {
    image: {
      async upload(file, context) {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            context.onProgress?.({
              loaded: e.loaded,
              total: e.total,
              percent: Math.round((e.loaded / e.total) * 100),
            });
          }
        };

        return new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              resolve({ url: data.url, name: data.name });
            } else {
              reject(new Error("Upload failed"));
            }
          };
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.send(formData);

          context.signal?.addEventListener("abort", () => {
            xhr.abort();
          });
        });
      },
    },
  },
});
```

---

## 6. 主题系统

### 6.1 EditorTheme 类型

```typescript
type EditorTheme = "light" | "dark";
```

### 6.2 主题切换

#### 初始化时设置主题

```typescript
const editor = new Editor(el, {
  theme: "dark",
});
```

#### 动态切换主题

```typescript
// 设置主题
editor.setTheme("dark");

// 切换主题
editor.toggleTheme();

// 获取当前主题
console.log(editor.theme); // "dark"
console.log(editor.isDark); // true
```

#### CSS 变量自定义主题

编辑器通过 `data-theme` 属性控制主题，可以通过 CSS 变量自定义：

```css
/* 亮色主题
[data-theme="light"] {
  --free-editor-bg: #ffffff;
  --free-editor-text: #333333;
}

/* 深色主题 */
[data-theme="dark"] {
  --free-editor-bg: #1a1a1a;
  --free-editor-text: #e0e0e0;
}
```

---

## 7. UI 组件

### 7.1 FloatingToolbar 浮动工具栏

#### 构造函数

```typescript
constructor(options: FloatingToolbarOptions)
```

**选项 FloatingToolbarOptions：**

| 属性         | 类型                             | 默认值            | 说明               |
| ------------ | -------------------------------- | ----------------- | ------------------ |
| `target`     | `HTMLElement \| DOMRect \| null` | -                 | 目标元素或位置矩形 |
| `placement`  | `FloatingPlacement`              | `"bottom-center"` | 弹出位置           |
| `offset`     | `number`                         | `3`               | 偏移量（像素）     |
| `closeOnEsc` | `boolean`                        | `true`            | 是否按 ESC 关闭    |
| `content`    | `string \| HTMLElement`          | -                 | 内容               |
| `onShow`     | `() => void`                     | -                 | 显示时回调         |
| `onClose`    | `() => void`                     | -                 | 关闭时回调         |

#### FloatingPlacement 类型：

```typescript
type FloatingPlacement =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";
```

#### 方法

##### `show()`

```typescript
show(): Promise<void>
```

显示浮动工具栏。

##### `hide(animate?)`

```typescript
hide(animate?: boolean): Promise<void>
```

隐藏浮动工具栏。

**参数：**

- `animate` - 是否播放动画，默认 `true`

##### `toggle()`

```typescript
toggle(): Promise<void>
```

切换显示状态。

##### `setTarget(target)`

```typescript
setTarget(target: FloatingTarget): void
```

设置目标元素。

##### `setPlacement(placement)`

```typescript
setPlacement(placement: FloatingPlacement): void
```

设置弹出位置。

##### `setOffset(offset)`

```typescript
setOffset(offset: number): void
```

设置偏移量。

##### `setContent(content)`

```typescript
setContent(content: string | HTMLElement): void
```

设置内容。

##### `getId()`

```typescript
getId(): string
```

获取唯一 ID。

##### `getElement()`

```typescript
getElement(): HTMLElement | null
```

获取 DOM 元素。

##### `isVisible()`

```typescript
isVisible(): boolean
```

是否可见。

##### `destroy()`

```typescript
destroy(): void
```

销毁。

#### 使用示例

```typescript
import { FloatingToolbar } from "@cat/free-editor";

const floating = new FloatingToolbar({
  target: document.getElementById("trigger"),
  placement: "bottom-center",
  content: "<p>这是浮动内容</p>",
  onShow: () => console.log("显示了"),
  onClose: () => console.log("关闭了"),
});

// 显示
await floating.show();

// 隐藏
await floating.hide();

// 切换
await floating.toggle();

// 销毁
floating.destroy();
```

---

### 7.2 Select 下拉选择器

#### 构造函数

```typescript
constructor(options?: SelectOptions)
```

**选项 SelectOptions：**

| 属性            | 类型                       | 默认值           | 说明       |
| --------------- | -------------------------- | ---------------- | ---------- |
| `container`     | `HTMLElement`              | `document.body`  | 挂载容器   |
| `options`       | `SelectOption[]`           | `[]`             | 选项数据   |
| `value`         | `string \| number \| null` | `null`           | 当前值     |
| `placeholder`   | `string`                   | `"请选择"`       | 占位文本   |
| `tooltip`       | `string`                   | `""`             | 提示文本   |
| `width`         | `string`                   | `"120px"`        | 触发器宽度 |
| `dropdownWidth` | `string`                   | `"auto"`         | 下拉框宽度 |
| `maxHeight`     | `string`                   | `"180px"`        | 最大高度   |
| `placement`     | `FloatingPlacement`        | `"bottom-start"` | 弹出位置   |
| `onChange`      | `(value, item) => void`    | `() => {}`       | 值变化回调 |

**SelectOption 接口：**

```typescript
interface SelectOption {
  label: string;
  value: string | number | null;
}
```

#### 方法

##### `openDropdown()`

```typescript
openDropdown(): Promise<void>
```

打开下拉框。

##### `close()`

```typescript
close(): Promise<void>
```

关闭下拉框。

##### `toggle()`

```typescript
toggle(): void
```

切换下拉框状态。

##### `setValue(value)`

```typescript
setValue(value: string | number | null): void
```

设置值。

##### `getValue()`

```typescript
getValue(): string | number | null
```

获取值。

##### `setOptions(options)`

```typescript
setOptions(options: SelectOption[]): void
```

设置选项列表。

##### `destroy()`

```typescript
destroy(): void
```

销毁选择器。

#### 使用示例

```typescript
import { Select } from "@cat/free-editor";

const select = new Select({
  options: [
    { label: "选项一", value: "1" },
    { label: "选项二", value: "2" },
    { label: "选项三", value: "3" },
  ],
  value: "1",
  onChange: (value, item) => {
    console.log("选中了:", value, item.label);
  },
});

// 追加到页面
document.body.appendChild(select.el);
```

---

### 7.3 createToolbarButton 工具栏按钮

```typescript
function createToolbarButton(
  content: HTMLElement,
  tooltip: string,
): HTMLElement;
```

创建工具栏按钮，带 tooltip 提示。

**参数：**

| 参数      | 类型          | 说明         |
| --------- | ------------- | ------------ |
| `content` | `HTMLElement` | 按钮内容元素 |
| `tooltip` | `string`      | 提示文本     |

**返回值：** `HTMLElement` - 按钮 DOM 元素

**示例：**

```typescript
import { createToolbarButton, createIcon } from "@cat/free-editor";

const icon = createIcon("<svg>...</svg>");
const button = createToolbarButton(icon, "粗体");

button.addEventListener("click", () => {
  console.log("点击了按钮");
});

toolbar.appendChild(button);
```

---

### 7.4 createIcon 图标

```typescript
function createIcon(svg: string): HTMLElement;
```

创建图标元素，包装 SVG。

**参数：**

| 参数  | 类型     | 说明       |
| ----- | -------- | ---------- |
| `svg` | `string` | SVG 字符串 |

**返回值：** `HTMLElement` - 包装后的图标元素

**抛出：** 如果 SVG 无效，抛出 `Error: Invalid svg`

**示例：**

```typescript
import { createIcon } from "@cat/free-editor";

const icon = createIcon(`
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path d="M13..."/>
  </svg>
`);
```

---

## 8. 类型定义

### 8.1 基础类型

#### EditorTheme

```typescript
type EditorTheme = "light" | "dark";
```

编辑器主题类型。

---

#### MediaType

```typescript
type MediaType = "image" | "video" | "file";
```

媒体类型。

---

### 8.2 上传相关类型

#### UploadProgress

```typescript
interface UploadProgress {
  loaded: number; // 已加载字节数
  total: number; // 总字节数
  percent: number; // 百分比
}
```

上传进度信息。

---

#### UploadResult

```typescript
interface UploadResult {
  url: string; // 资源 URL
  name?: string; // 文件名称
}
```

上传结果。

---

#### UploadContext

```typescript
interface UploadContext {
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
  config: MediaUploaderConfig;
}
```

上传上下文。

---

#### UploadTaskStatus

```typescript
type UploadTaskStatus = "idle" | "uploading" | "success" | "error" | "canceled";
```

上传任务状态。

---

#### UploadTask

```typescript
interface UploadTask {
  id: string;
  file: File;
  type: MediaType;
  progress: number;
  status: UploadTaskStatus;
  response?: UploadResult;
  error?: Error;
  start(): Promise<void>;
  retry(): Promise<void>;
  cancel(): void;
}
```

上传任务。

---

#### UploadGenerator

```typescript
type UploadGenerator = {
  upload(file: File, type: MediaType): Promise<UploadTask | undefined>;
  retry(taskId: string): void;
  cancel(taskId: string): void;
  getTask(id: string): UploadTask | undefined;
};
```

上传生成器（通过 `editor.storage.mediaUploader` 访问）。

---

### 8.3 插件相关类型

#### EditorPluginKey

```typescript
type EditorPluginKey =
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
  | "heading";
```

插件键名。

---

#### EditorPlugin

```typescript
interface EditorPlugin {
  key: EditorPluginKey;
  toolbar?: (editor: Editor) => HTMLElement;
  extensions?: AnyExtension | AnyExtension[];
  editorProps?: EditorProps;
  setup?: (editor: Editor, context: EditorPluginContext) => void | (() => void);
}
```

编辑器插件接口。

---

#### EditorPluginContext

```typescript
interface EditorPluginContext {
  uploader?: MediaUploaderOptions;
  mediaEngine?: MediaEngine | null;
}
```

插件上下文。

---

## 9. 常见问题

### Q1: 编辑器样式不生效？

请确保手动导入了样式文件：

```typescript
import "@cat/free-editor/style.css";
```

### Q2: 图片上传失败？

检查以下几点：

1. 是否配置了 `uploader.image.action` 上传地址
2. 服务器返回格式是否正确（需要包含 `url` 字段
3. 是否超过 `maxSize` 或 `accept` 限制

### Q3: 如何自定义上传逻辑？

使用 `upload` 配置项：

```typescript
{
  uploader: {
    image: {
      async upload(file, context) {
        // 自定义上传逻辑
        return { url: "...", name: "..." };
      },
    },
  },
}
```

### Q4: 如何只保留部分插件？

使用 `include` 配置：

```typescript
const editor = new Editor(el, {
  include: ["heading", "fontBold", "fontItalic"],
});
```

### Q5: 编辑器销毁后还能使用吗？

不能。销毁后调用 `getHtml()` 等方法会抛出错误。请确保在销毁前获取内容。

### Q6: 支持深色模式吗？

支持。使用 `theme: "dark"` 初始化，或调用 `editor.setTheme("dark")` 动态切换。

---

_文档版本: v1.0.0_
