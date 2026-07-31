<h4 align="right"><a href="./README.md">English</a> | <strong>简体中文</strong> | <a href="./README.ja-JP.md">日本語</a></h4>
<br/>
<p align="center">
  <img src="./playground/src/assets/logo.png" alt="logo">
</p>
<h1 align="center">FreeEditor</h1>
<h4 align="center">一个基于 TipTap 内核开发的轻量级富文本编辑器</h4>
<h4 align="center">开箱即用，支持所有前端框架，内置中英日三种语言</h4>
<p align="center">
  <img src="./playground/src/assets/image.png" alt="image">
</p>

### 开始使用

如果有帮助到您，请点一个 star，这样，在发布新的版本时，您可以及时获得通知。

```bash
npm install @catmasks/free-editor
```

或者

```bash
pnpm add @catmasks/free-editor
```

### CDN 引入

如果你的项目不使用打包工具，可以通过 ESM CDN 直接在浏览器中使用。

> **注意**：
>
> - 本包仅提供 ESM 格式，必须使用 `<script type="module">` 方式加载，不支持传统 `<script>` 标签引入。
> - 由于 `@tiptap/core`、`@tiptap/pm`、`@tiptap/extension-gapcursor` 作为 peerDependencies 外部化，CDN 引入时需确保这些依赖可被解析。使用 esm.sh 等支持自动依赖解析的 CDN 可省去手动配置。

**使用 esm.sh（推荐）**

```html
<script type="module">
  import { Editor, i18n } from "https://esm.sh/@catmasks/free-editor@0.0.4";
  import "https://esm.sh/@catmasks/free-editor@0.0.4/style.css";

  const editor = new Editor(document.getElementById("editor"), {
    content: "<p>Hello World</p>",
    placeholder: "请输入内容...",
  });
</script>
```

**使用 importmap（可选）**

如果你希望使用裸导入风格，可以配合 importmap：

```html
<script type="importmap">
  {
    "imports": {
      "@catmasks/free-editor": "https://esm.sh/@catmasks/free-editor@0.0.4",
      "@catmasks/free-editor/style.css": "https://esm.sh/@catmasks/free-editor@0.0.4/style.css"
    }
  }
</script>

<script type="module">
  import { Editor, i18n } from "@catmasks/free-editor";
  import "@catmasks/free-editor/style.css";

  const editor = new Editor(document.getElementById("editor"), {
    content: "<p>Hello World</p>",
  });
</script>
```

**使用 jsdelivr / unpkg（备选）**

使用 jsdelivr 或 unpkg 时，需确保 peerDependencies 也能正确加载（建议使用支持自动解析的 esm.sh）。

```html
<script type="importmap">
  {
    "imports": {
      "@tiptap/core": "https://esm.sh/@tiptap/core@3.26.1",
      "@tiptap/pm": "https://esm.sh/@tiptap/pm@3.26.1",
      "@tiptap/pm/state": "https://esm.sh/@tiptap/pm@3.26.1/state",
      "@tiptap/pm/view": "https://esm.sh/@tiptap/pm@3.26.1/view",
      "@tiptap/extension-gapcursor": "https://esm.sh/@tiptap/extension-gapcursor@3.26.1"
    }
  }
</script>
<script type="module">
  import {
    Editor,
    i18n,
  } from "https://cdn.jsdelivr.net/npm/@catmasks/free-editor@0.0.4/dist/index.js";
  import "https://cdn.jsdelivr.net/npm/@catmasks/free-editor@0.0.4/dist/style.css";
  // ... 使用 edito
</script>
```

> **提示**：
>
> - 请将 `@0.0.4` 替换为你实际使用的版本号。
> - 样式文件 `style.css` **必须单独引入**，否则编辑器将无法正常显示。

## 导航

- [1. 快速开始](#1-快速开始)
- [2. 配置项](#2-配置项)
- [3. 实例属性与方法](#3-实例属性与方法)
- [4. 内置插件](#4-内置插件)
- [5. 媒体上传](#5-媒体上传)
- [6. 国际化 (i18n)](#6-国际化-i18n)

---

## 1. 快速开始

### 基础用法

```typescript
import { Editor } from "@catmasks/free-editor";
import "@catmasks/free-editor/style.css";

// 创建编辑器
const editor = new Editor(document.getElementById("editor"), {
  content: "<p>Hello World</p>",
  placeholder: "请输入内容...",
});
```

---

## 2. 配置项

构造函数第二个参数接受 `EditorOptions` 配置对象：

```typescript
interface EditorOptions {
  content?: string;
  locale?: Locale;
  theme?: EditorTheme;
  placeholder?: string;
  include?: EditorPluginKey[];
  exclude?: EditorPluginKey[];
  uploader?: MediaUploaderOptions;
}
```

### `content`

编辑器初始化内容，HTML 字符串。

```typescript
content?: string
```

### `locale`

编辑器初始化语种。

- **默认值：** `"zh-CN"`
- **可选值：** `"zh-CN"` | `"en"` | `"ja-JP"`

```typescript
locale?: Locale
```

### `theme`

编辑器主题。

- **默认值：** `"light"`
- **可选值：** `"light"` | `"dark"`

```typescript
theme?: EditorTheme
```

### `placeholder`

占位符文本，编辑器为空时显示。

- **默认值：** `"请输入内容..."`

```typescript
placeholder?: string
```

### `include`

只包含指定的插件。为空时包含所有插件。

- **默认值：** `[]`（包含所有插件）

```typescript
include?: EditorPluginKey[]
```

**示例：** 只启用标题和粗体

```typescript
include: ["heading", "fontBold"];
```

### `exclude`

排除指定的插件。

- **默认值：** `[]`（不排除任何插件）

```typescript
exclude?: EditorPluginKey[]
```

**示例：** 排除代码块

```typescript
exclude: ["codeBlock"];
```

### `uploader`

媒体上传配置，支持图片、视频、附件三种类型的独立配置。详见 [第 5 章](#5-媒体上传)。

```typescript
uploader?: MediaUploaderOptions
```

---

## 3. 实例属性与方法

### 3.1 实例属性

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

获取当前主题，返回 `"light"` 或 `"dark"`。

```typescript
console.log(editor.theme); // "light"
```

#### `isDark`

是否为深色模式。

```typescript
console.log(editor.isDark); // false
```

#### `locale`

获取当前语言。

```typescript
console.log(editor.locale); // "zh-CN"
```

### 3.2 实例方法

#### `setTheme(theme)`

设置主题。

```typescript
setTheme(theme: EditorTheme): void
```

**参数：**

| 参数    | 类型          | 说明                            |
| ------- | ------------- | ------------------------------- |
| `theme` | `EditorTheme` | 主题名称，`"light"` 或 `"dark"` |

#### `toggleTheme()`

切换主题（亮色/深色）。

```typescript
toggleTheme(): void
```

#### `setLocale(locale)`

设置编辑器语言。

```typescript
setLocale(locale: Locale): void
```

**参数：**

| 参数     | 类型     | 说明                                       |
| -------- | -------- | ------------------------------------------ |
| `locale` | `Locale` | 目标语言，`"zh-CN"` 或 `"en"` 或 `"ja-JP"` |

#### `getHtml()`

获取编辑器 HTML 内容。

```typescript
getHtml(): string
```

**返回值：** `string` - HTML 字符串

**抛出：** 如果编辑器已销毁，抛出 `Error: Editor has been destroyed`

#### `destroy()`

销毁编辑器，清理所有资源和事件监听。

```typescript
destroy(): void
```

---

## 4. 内置插件

以下是所有可用的插件键名（`EditorPluginKey`）：

| 插件键名        | 名称     | 说明                        |
| --------------- | -------- | --------------------------- |
| `heading`       | 标题     | 支持 H1-H6 标题             |
| `fontBold`      | 粗体     | 文字加粗/取消加粗           |
| `fontItalic`    | 斜体     | 文字倾斜/取消倾斜           |
| `fontColor`     | 字体颜色 | 设置文字颜色                |
| `fontHighlight` | 高亮     | 设置文字背景高亮            |
| `fontFamily`    | 字体     | 设置字体                    |
| `fontSize`      | 字号     | 设置文字大小                |
| `alignment`     | 对齐     | 文字左对齐/居中/右对齐      |
| `link`          | 链接     | 插入/编辑/移除链接          |
| `codeBlock`     | 代码块   | 插入代码块                  |
| `image`         | 图片     | 插入图片，支持拖拽/粘贴上传 |
| `video`         | 视频     | 插入视频，支持拖拽/粘贴上传 |
| `attachment`    | 附件     | 插入附件，支持拖拽/粘贴上传 |
| `underline`     | 下划线   | 文字添加下划线              |
| `strike`        | 删除线   | 文字添加删除线              |
| `superscript`   | 上标     | 文字添加上标                |
| `subscript`     | 下标     | 文字添加下标                |
| `orderedList`   | 有序列表 | 插入有序列表                |
| `bulletList`    | 无序列表 | 插入无序列表                |

> **提示：** 使用 `include` 或 `exclude` 配置项可灵活控制启用哪些插件。

---

## 5. 媒体上传

### 5.1 配置结构

上传配置按媒体类型分为三类：

```typescript
interface MediaUploaderOptions {
  image?: MediaUploaderConfig; // 图片上传配置
  video?: MediaUploaderConfig; // 视频上传配置
  attachment?: MediaUploaderConfig; // 附件上传配置
}
```

### 5.2 上传配置项 (`MediaUploaderConfig`)

以下是单个媒体类型的所有可配置项：

#### `action`

上传地址 URL。

```typescript
action?: string
```

#### `method`

请求方法。

- **默认值：** `"POST"`

```typescript
method?: string
```

#### `headers`

请求头。

```typescript
headers?: HeadersInit
```

#### `withCredentials`

是否携带凭证（Cookie 等）。

- **默认值：** `false`

```typescript
withCredentials?: boolean
```

#### `fieldName`

表单字段名。

- **默认值：** `"file"`

```typescript
fieldName?: string
```

#### `maxSize`

最大文件大小（字节）。

- **默认值：** `Infinity`

```typescript
maxSize?: number
```

#### `accept`

接受的文件 MIME 类型数组。

```typescript
accept?: string[]
```

**示例：**

```typescript
accept: ["image/png", "image/jpeg"];
```

#### `data`

额外的表单数据，支持对象或返回对象的函数。

```typescript
data?: Record<string, any> | (() => Record<string, any>)
```

#### `format`

格式化服务器响应结果，返回标准的 `UploadResult`。

```typescript
format?: (result: any) => UploadResult | Promise<UploadResult>
```

**示例：**

```typescript
format: (response) => ({
  url: response.data.url,
  name: response.data.filename,
});
```

#### `upload`

自定义上传函数。设置此函数后，默认上传逻辑将被替换。

```typescript
upload?: (file: File, context: UploadContext) => Promise<UploadResult>
```

**参数：**

- `file` - 文件对象
- `context` - 上传上下文，包含 `signal`（中止信号）、`config`（配置）、`onProgress`（进度回调）

**示例：**

```typescript
upload: async (file, context) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
    signal: context.signal,
  });

  const data = await res.json();

  context.onProgress?.({ percent: 100 });

  return {
    url: data.url,
    name: data.name,
  };
};
```

#### `beforeUpload`

上传前钩子。返回 `false` 取消上传，返回新 `File` 对象替换原文件。

```typescript
beforeUpload?: (file: File) => File | false | Promise<File | false>
```

#### `validate`

验证文件。返回错误信息字符串表示验证失败。

```typescript
validate?: (file: File) => string | void
```

**示例：**

```typescript
validate: (file) => {
  if (file.size > 10 * 1024 * 1024) {
    return "文件不能超过 10MB";
  }
};
```

### 5.3 回调事件

#### `onProgress`

上传进度回调。

```typescript
onProgress?: (progress: UploadProgress, file: File) => void
```

`UploadProgress` 结构：

```typescript
interface UploadProgress {
  loaded: number; // 已加载字节数
  total: number; // 总字节数
  percent: number; // 百分比
}
```

#### `onSuccess`

上传成功回调。

```typescript
onSuccess?: (result: UploadResult, file: File) => void
```

`UploadResult` 结构：

```typescript
interface UploadResult {
  url: string; // 资源 URL
  name?: string; // 文件名称
}
```

#### `onUploadError`

上传错误回调。

```typescript
onUploadError?: (error: Error, file: File) => void
```

#### `onTypeError`

文件类型错误回调。

```typescript
onTypeError?: (error: Error, file: File) => void
```

#### `onSizeError`

文件大小错误回调。

```typescript
onSizeError?: (error: Error, file: File) => void
```

#### `onValidateError`

验证错误回调。

```typescript
onValidateError?: (error: Error, file: File) => void
```

### 5.4 完整示例

```typescript
import { Editor, i18n } from "@catmasks/free-editor";
import type { UploadResult, UploadContext } from "@catmasks/free-editor";

const editor = new Editor(document.getElementById("editor"), {
  uploader: {
    // 图片上传配置
    image: {
      maxSize: 5 * 1024 * 1024, // 5MB
      accept: ["image/png", "image/jpeg"],
      async upload(file: File, ctx: UploadContext) {
        return new Promise<UploadResult>((resolve, reject) => {
          // 自定义上传逻辑...
          resolve({ url: "https://example.com/image.png" });
        });
      },
    },
    // 视频上传配置
    video: {
      maxSize: 500 * 1024 * 1024, // 500MB
      accept: ["video/*"],
      onUploadError(error) {
        alert(i18n.t("upload.uploadFailed"));
      },
    },
    // 附件上传配置
    attachment: {
      onSuccess(result, file) {
        console.log("上传成功:", result.url);
      },
    },
  },
});
```

---

## 6. 国际化 (i18n)

`i18n` 是一个全局单例，用于管理多语言。

```typescript
import { i18n } from "@catmasks/free-editor";
```

### 6.1 属性

#### `locale`

当前语言。

```typescript
console.log(i18n.locale); // "zh-CN"
```

### 6.2 方法

#### `t(key, ...args)`

获取当前语言下 `key` 的翻译文本。支持占位符替换 `{0}`, `{1}`...。

```typescript
t(key: string, ...args: any[]): string
```

**示例：**

```typescript
i18n.t("toolbar.bold"); // "粗体"
i18n.t("upload.fileSizeExceeded"); // "文件大小超出限制"
```

**可用的翻译键：**

| 命名空间     | 说明         |
| ------------ | ------------ |
| `common`     | 通用文本     |
| `toolbar`    | 工具栏文本   |
| `link`       | 链接相关文本 |
| `fontFamily` | 字体相关文本 |
| `fontSize`   | 字号相关文本 |
| `alignment`  | 对齐相关文本 |
| `heading`    | 标题相关文本 |
| `upload`     | 上传相关文本 |
| `media`      | 媒体节点文本 |
| `attachment` | 附件相关文本 |

#### `setLocale(locale)`

设置当前语言。

```typescript
setLocale(locale: Locale): void
```

**参数：**

| 参数     | 类型     | 说明                                     |
| -------- | -------- | ---------------------------------------- |
| `locale` | `Locale` | 目标语言：`"zh-CN"` / `"en"` / `"ja-JP"` |

#### `extend(messages)`

扩展当前语言的消息对象（深度合并）。

> **注意：** 该方法必须在编辑器初始化前调用，否则对编辑器无效果。

```typescript
extend(messages: DeepPartial<LocaleMessages>): void
```

**示例：**

```typescript
import { i18n } from "@catmasks/free-editor";

// 在编辑器创建前扩展翻译
i18n.extend({
  toolbar: {
    bold: "自定义粗体",
    italic: "自定义斜体",
  },
});

// 然后创建编辑器
const editor = new Editor(...);
```

#### `subscribe(callback)`

订阅语言变化事件。返回一个取消订阅函数。

> **注意：** 销毁时请调用返回的取消订阅函数，防止内存泄漏。

```typescript
subscribe(callback: (locale: Locale) => void): () => void
```

**示例：**

```typescript
const unsubscribe = i18n.subscribe((locale) => {
  console.log("语言切换为:", locale);
});

// 不再需要时取消订阅
unsubscribe();
```
