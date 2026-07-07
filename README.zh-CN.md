<h4 align="right"><a href="./README.md">English</a> | <strong>简体中文</strong> | <a href="./README.ja-JP.md">日本語</a></h4>
<br/>
<p align="center">
  <img src="./playground/src/assets/logo.png" alt="logo">
</p>
<h1 align="center">FreeEditor</h1>
<h4 align="center">一个基于TipTap内核开发的轻量级富文本编辑器</h4>
<h4 align="center">开箱即用、支持所有前端框架</h4>

### 开始关注并使用

如果有帮助到您，请点一个 star，这样，在发布新的版本时，您可以及时获得通知。

```bash
npm install @catmasks/free-editor
```

或者

```bash
pnpm add @catmasks/free-editor
```

## 导航

编辑器内置以下插件：

`EditorPluginKey`:

| 插件键名               | 名称     | 说明                        |
| ---------------------- | -------- | --------------------------- |
| `heading`              | 标题     | 支持 H1-H6 标题             |
| `fontBold`             | 粗体     | 文字加粗/取消加粗           |
| `fontItalic`           | 斜体     | 文字倾斜/取消倾斜           |
| `fontColor`            | 字体颜色 | 设置文字颜色                |
| `fontHighlight`        | 高亮     | 设置文字背景高亮            |
| `fontFamily`           | 字体     | 设置字体                    |
| `fontSize`             | 字号     | 设置文字大小                |
| `link`                 | 链接     | 插入/编辑/移除链接          |
| `codeBlock`            | 代码块   | 插入代码块                  |
| [`image`](#2-媒体上传) | 图片     | 插入图片，支持拖拽/粘贴上传 |
| [`video`](#2-媒体上传) | 视频     | 插入视频，支持拖拽/粘贴上传 |

## 1. 快速开始

### 1.1 基础用法

```typescript
import { Editor } from "@catmasks/free-editor";
import "@catmasks/free-editor/style.css";

// 创建编辑器
const editor = new Editor(document.getElementById("editor"), {
  content: "<p>Hello World</p>",
  placeholder: "请输入内容...",
});
```

### 1.2 Editor 构造函数

**函数签名:**

```typescript
constructor(el: HTMLElement, options?: EditorOptions)
```

**参数：**

| 参数      | 类型            | 说明                   |
| --------- | --------------- | ---------------------- |
| `el`      | `HTMLElement`   | 编辑器挂载的 DOM 元素  |
| `options` | `EditorOptions` | 编辑器配置选项（可选） |

### 1.3 配置项 EditorOptions

#### `content`

```typescript
content?: string
```

编辑器初始化内容，HTML 字符串。

**默认值：** `undefined`

#### `theme`

```typescript
theme?: EditorTheme
```

编辑器主题。

**默认值：** `"light"`

**可选值：** `"light"` | `"dark"`

#### `placeholder`

```typescript
placeholder?: string
```

占位符文本，编辑器为空时显示。

**默认值：** `"请输入内容..."`

#### `include`

```typescript
include?: EditorPluginKey[]
```

只包含指定的插件。为空时包含所有插件）。

**默认值：** `[]`（包含所有插件）

#### `exclude`

```typescript
exclude?: EditorPluginKey[]
```

排除指定的插件。

**默认值：** `[]`（不排除任何插件）

#### `uploader`

```typescript
uploader?: MediaUploaderOptions
```

媒体上传配置，支持图片、视频、文件三种类型的独立配置。
详细配置说明请参考 [第 2 章](#2-媒体上传)。

### 1.4 实例属性

#### `isMounted`

获取编辑器是否已挂载。

```typescript
console.log(editor.isMounted); // true
```

#### `isDestroyed`

获取编辑器是否已销毁。

```typescript
console.log(editor.isDestroyed); // false
```

#### `theme`

获取当前主题。返回 `"light"` 或 `"dark"`。

```typescript
console.log(editor.theme); // "light"
```

#### `isDark`

是否为深色模式。

```typescript
console.log(editor.isDark); // false
```

### 1.5 实例方法

#### `setTheme(theme)`

```typescript
setTheme(theme: EditorTheme): void
```

设置主题。

**参数：**

| 参数    | 类型          | 说明                            |
| ------- | ------------- | ------------------------------- |
| `theme` | `EditorTheme` | 主题名称，`"light"` 或 `"dark"` |

#### `toggleTheme()`

```typescript
toggleTheme(): void
```

切换主题（亮色/深色）。

#### `getHtml()`

```typescript
getHtml(): string
```

获取编辑器 HTML 内容。

**返回值：** `string` - HTML 字符串

**抛出：** 如果编辑器已销毁，抛出 `Error: Editor has been destroyed`

#### `destroy()`

```typescript
destroy(): void
```

销毁编辑器，清理所有资源和事件监听。

## 2. 媒体上传

### 2.1 MediaUploaderOptions

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

### 2.2 MediaUploaderConfig

单个媒体类型的上传配置。

#### `action`

```typescript
action?: string
```

上传地址 URL。

**默认值：** `undefined`

#### `method`

```typescript
method?: string
```

请求方法。

**默认值：** `"POST"`

#### `headers`

```typescript
headers?: HeadersInit
```

请求头。

#### `withCredentials`

```typescript
withCredentials?: boolean
```

是否携带凭证（Cookie等）。

**默认值：** `false`

#### `fieldName`

```typescript
fieldName?: string
```

表单字段名。

**默认值：** `"file"`

#### `maxSize`

```typescript
maxSize?: number
```

最大文件大小（字节）。

**默认值：** `Infinity`

#### `accept`

```typescript
accept?: string[]
```

接受的文件类型。

#### `data`

```typescript
data?: Record<string, any> | (() => Record<string, any>)
```

额外的表单数据。

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

    context.onProgress?.({ percent: 100});

    return {
      url: data.url,
      name: data.name,
    };
  },
}
```

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

#### `onProgress`

```typescript
onProgress?: (progress: UploadProgress, file: File) => void
```

进度回调。

#### `onSuccess`

```typescript
onSuccess?: (result: UploadResult, file: File) => void
```

成功回调。

#### `onUploadError`

```typescript
onUploadError?: (error: Error, file: File) => void
```

上传错误回调。

#### `onTypeError`

```typescript
onTypeError?: (error: Error, file: File) => void
```

文件类型错误回调。

#### `onSizeError`

```typescript
onSizeError?: (error: Error, file: File) => void
```

文件大小错误回调。

#### `onValidateError`

```typescript
onValidateError?: (error: Error, file: File) => void
```

验证错误回调。
