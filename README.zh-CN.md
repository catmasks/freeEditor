<h4 align="right"><a href="./README.md">English</a> | <strong>简体中文</strong> | <a href="./README.ja-JP.md">日本語</a></h4>
<br/>
<p align="center">
  <img src="./csrTest/src/assets/logo.png" alt="logo">
</p>
<h1 align="center">FreeEditor</h1>
<h4 align="center">一个基于 TipTap 内核开发的轻量级富文本编辑器</h4>
<h4 align="center">开箱即用，支持所有前端框架，内置中英日三种语言，兼容SSR</h4>
<p align="center">
  <img src="./csrTest/src/assets/freeEditor.png" alt="freeEditor">
</p>

---

## 🧭 导航

- [1. 快速开始](#quick-start)
- [2. 配置项](#configuration)
- [3. 实例属性与方法](#instance-properties-methods)
- [4. 内置插件](#built-in-plugins)
- [5. 媒体上传](#media-upload)
- [6. 国际化 (i18n)](#i18n)
- [7. SSR 支持](#ssr-support)

---

## 🚀 <a id="quick-start"></a>1. 快速开始

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

### 💡 提示

> 如果有帮助到您，请点一个 ⭐，这样，在发布新的版本时，您可以及时获得通知。

---

## 📦 安装

```bash
npm install @catmasks/free-editor
```

或者

```bash
pnpm add @catmasks/free-editor
```

### CDN 引入

如果项目不使用 Vite、Webpack 等构建工具，可以通过 ESM CDN 使用 Free Editor。

> **⚠️ 注意**
>
> - 浏览器 CDN 场景请使用 ESM。
> - 推荐使用 **esm.sh**，它可以自动解析 Free Editor 的 npm 依赖，无需手动配置依赖。
> - Free Editor 部分功能使用动态 `import()` 加载，构建后会生成 `chunks/` 目录，部署时需要与 `index.js` 一起保留。
> - `style.css` 需要单独引入。

#### 使用 esm.sh（推荐）

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>Free Editor CDN</title>

    <link
      rel="stylesheet"
      href="https://esm.sh/@catmasks/free-editor@1.0.0/style.css"
    />
  </head>

  <body>
    <div id="editor"></div>

    <script type="module">
      import { Editor } from "https://esm.sh/@catmasks/free-editor@1.0.0";

      const editor = new Editor(document.getElementById("editor"), {
        content: "<p>Hello World</p>",
        placeholder: "请输入内容...",
      });
    </script>
  </body>
</html>
```

> 使用 esm.sh 时，只需要引入 `@catmasks/free-editor`，其 npm 依赖会自动解析。

#### 使用 jsDelivr / unpkg

如果直接加载 Free Editor 的 `dist/index.js`，由于部分依赖被 external 化，浏览器无法直接解析 npm 裸模块：

```js
import { Editor } from "@tiptap/core";
```

此时需要使用 `importmap` 映射 external 依赖：

```html
<script type="importmap">
  {
    "imports": {
      "@tiptap/core": "https://esm.sh/@tiptap/core@3.26.1",
      "@tiptap/pm/state": "https://esm.sh/@tiptap/pm@3.26.1/state",
      "@tiptap/pm/view": "https://esm.sh/@tiptap/pm@3.26.1/view",
      "@tiptap/pm/history": "https://esm.sh/@tiptap/pm@3.26.1/history",
      "@tiptap/extension-gapcursor": "https://esm.sh/@tiptap/extension-gapcursor@3.26.1",
      "docx": "https://esm.sh/docx@9.7.1",
      "jspdf": "https://esm.sh/jspdf@4.2.1",
      "markdown-it": "https://esm.sh/markdown-it@14.1.0",
      "prosemirror-markdown": "https://esm.sh/prosemirror-markdown@1.13.5"
    }
  }
</script>
```

> **提示**
>
> - 推荐优先使用 esm.sh。
> - 如果使用 jsDelivr / unpkg，需要根据当前版本的 external 依赖配置 `importmap`。
> - 构建后的 `chunks/` 目录必须与 `index.js` 一起部署。
> - `style.css` 必须单独引入。
> - 生产项目推荐使用 npm/pnpm + Vite 等构建工具。

---

## ⚙️ <a id="configuration"></a>2. 配置项

构造函数第二个参数接受 `EditorOptions` 配置对象：

```typescript
interface EditorOptions {
  content?: string;
  locale?: Locale;
  height?: number;
  maxHeight?: number;
  theme?: EditorTheme;
  disabled?: boolean;
  readonly?: boolean;
  placeholder?: string;
  include?: EditorPluginKey[];
  exclude?: EditorPluginKey[];
  uploader?: MediaUploaderOptions;
  onChange?: (html: string) => void;
  onCreated?: () => void;
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

### `height`

编辑器初始高度，单位 `PX`。

- **默认值：** `undefined`

```typescript
height?: number
```

### `maxHeight`

编辑器最大高度，单位 `PX`。

- **默认值：** `undefined`

```typescript
maxHeight?: number
```

### `theme`

编辑器主题。

- **默认值：** `"light"`
- **可选值：** `"light"` | `"dark"`

```typescript
theme?: EditorTheme
```

### `disabled`

是否禁用编辑器。

- **默认值：** `false`

```typescript
disabled?: boolean
```

### `readonly`

是否只读编辑器。

- **默认值：** `false`

```typescript
readonly?: boolean
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

媒体上传配置，支持图片、视频、附件三种类型的独立配置。详见 [第 5 章](#media-upload)。

```typescript
uploader?: MediaUploaderOptions
```

### `onChange`

内容变化回调。当文档内容变化时触发（如输入、执行命令、媒体上传等），回调参数为变化后的 HTML 字符串。

```typescript
onChange?: (html: string) => void
```

**示例：**

```typescript
const editor = new Editor(el, {
  onChange: (html) => {
    console.log("内容已变化：", html);
  },
});
```

### `onCreated`

创建完成回调（无参数）。编辑器已挂载并完成初始化时触发。

```typescript
onCreated?: () => void
```

**示例：**

```typescript
const editor = new Editor(el, {
  onCreated: () => {
    console.log("编辑器已挂载初始化完成");
  },
});
```

---

## 🧩 <a id="instance-properties-methods"></a>3. 实例属性与方法

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

#### `disabled`

获取编辑器是否已禁用。

```typescript
console.log(editor.disabled); // false
```

#### `readonly`

获取编辑器是否只读。

```typescript
console.log(editor.readonly); // false
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

| 参数     | 类型     | 说明                                       |
| -------- | -------- | ------------------------------------------ |
| `locale` | `Locale` | 目标语言，`"zh-CN"` 或 `"en"` 或 `"ja-JP"` |

#### `getHtml()`

获取编辑器 HTML 内容。

```typescript
getHtml(): string
```

#### `getJson()`

获取编辑器 JSON 内容。

```typescript
getJson(): string
```

**返回值：** `string` - JSON 字符串  
**抛出：** 如果编辑器已销毁，抛出 `Error: Editor has been destroyed`

#### `setHtml(html)`

设置编辑器 HTML 内容，调用后编辑器内容即被替换；传空字符串时清空内容。

```typescript
setHtml(html: string): void
```

| 参数   | 类型     | 说明                |
| ------ | -------- | ------------------- |
| `html` | `string` | HTML 字符串，可为空 |

**示例：**

```typescript
// 替换内容
editor.setHtml("<p>新的内容</p>");

// 清空内容
editor.setHtml("");
```

**抛出：** 如果编辑器已销毁，抛出 `Error: Editor has been destroyed`

#### `pauseAllVideos()`

暂停编辑器内全部视频。返回对象包含暂停结果与视频总数。

```typescript
pauseAllVideos(): { state: boolean; total: number }
```

| 字段    | 类型     | 说明                                        |
| ------- | -------- | ------------------------------------------- |
| `state` | `boolean` | 是否全部成功暂停                            |
| `total` | `number`  | 编辑器内视频总数                            |

**示例：**

```typescript
const result = editor.pauseAllVideos();
// { state: true, total: 2 } —— 成功暂停了 2 个视频
```

**说明：** 编辑器销毁（`destroy()`）时会自动暂停全部视频，无需手动调用。

**抛出：** 如果编辑器已销毁，抛出 `Error: Editor has been destroyed`

#### `setDisabled(disabled)`

设置编辑器禁用状态。

```typescript
setDisabled(disabled: boolean): void
```

#### `setReadonly(readonly)`

设置编辑器只读状态。

```typescript
setReadonly(readonly: boolean): void
```

#### `destroy()`

销毁编辑器，清理所有资源和事件监听。

```typescript
destroy(): void
```

---

## 📋 <a id="built-in-plugins"></a>4. 内置插件

以下是所有可用的插件键名（`EditorPluginKey`）：

| 插件键名        | 名称      | 说明                         |
| --------------- | --------- | ---------------------------- |
| `heading`       | 标题      | 支持 H1-H6 标题              |
| `fontBold`      | 粗体      | 文字加粗/取消加粗            |
| `fontItalic`    | 斜体      | 文字倾斜/取消倾斜            |
| `fontColor`     | 字体颜色  | 设置文字颜色                 |
| `fontHighlight` | 高亮      | 设置文字背景高亮             |
| `fontFamily`    | 字体      | 设置字体                     |
| `fontSize`      | 字号      | 设置文字大小                 |
| `alignment`     | 对齐      | 文字左对齐/居中/右对齐       |
| `link`          | 链接      | 插入/编辑/移除链接           |
| `codeBlock`     | 代码块    | 插入代码块                   |
| `image`         | 图片      | 插入图片，支持拖拽/粘贴上传  |
| `video`         | 视频      | 插入视频，支持拖拽/粘贴上传  |
| `attachment`    | 附件      | 插入附件，支持拖拽/粘贴上传  |
| `underline`     | 下划线    | 文字添加下划线               |
| `strike`        | 删除线    | 文字添加删除线               |
| `superscript`   | 上标      | 文字添加上标                 |
| `subscript`     | 下标      | 文字添加下标                 |
| `orderedList`   | 有序列表  | 插入有序列表                 |
| `bulletList`    | 无序列表  | 插入无序列表                 |
| `taskList`      | 任务列表  | 插入带复选框的任务列表       |
| `indent`        | 缩进      | 增加缩进                     |
| `outdent`       | 减少缩进  | 减少缩进                     |
| `lineBreak`     | 换行      | 插入换行                     |
| `lineHeight`    | 行高      | 设置段落行高                 |
| `blockquote`    | 引用      | 插入引用块                   |
| `divider`       | 分割线    | 插入水平分割线               |
| `inlineCode`    | 行内代码  | 插入行内代码（如 `code`）    |
| `formatPainter` | 格式刷    | 格式刷插件，用于设置文字格式 |
| `undo`          | 撤销      | 撤销上一步操作               |
| `redo`          | 重做      | 重做上一步操作               |
| `table`         | 表格      | 插入/编辑表格                |
| `clearFormat`   | 清除格式  | 清除选中文本的所有格式       |
| `markdown`      | Markdown  | 支持 Markdown 格式           |
| `exportWord`    | 导出 Word | 导出为 Word 文档             |
| `importWord`    | 导入 Word | 导入 Word 文档               |
| `exportPdf`     | 导出 PDF  | 导出为 PDF 文档              |

> **💡 提示：** 使用 `include` 或 `exclude` 配置项可灵活控制启用哪些插件。

---

## 📎 <a id="media-upload"></a>5. 媒体上传

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

## 🌐 <a id="i18n"></a>6. 国际化（i18n）

`i18n` 是 Free Editor 提供的全局国际化单例，用于管理编辑器的语言、翻译消息以及自定义语言扩展。

```typescript
import { i18n } from "@catmasks/free-editor";
```

Free Editor 默认提供以下内置语言：

- `zh-CN`：简体中文
- `en`：English
- `ja-JP`：日本語

同时支持通过 `addMessages()` 注册自定义语言。

---

### 6.1 属性

#### `locale`

获取当前使用的语言。

```typescript
console.log(i18n.locale);
// "zh-CN"
```

类型：

```typescript
Locale;
```

---

### 6.2 方法

#### `t(key, ...args)`

获取当前语言下指定 `key` 的翻译文本。

支持使用点路径访问嵌套的翻译内容，并支持 `{0}`、`{1}` 等占位符参数。

```typescript
t(key: string, ...args: unknown[]): string
```

**示例：**

```typescript
i18n.t("toolbar.bold");
// "粗体"

i18n.t("upload.fileSizeExceeded");
// "文件大小超出限制"
```

使用占位符：

```typescript
i18n.t("common.count", 10);
// 例如："共 10 项"
```

如果指定的翻译键不存在，则返回传入的 `key`：

```typescript
i18n.t("unknown.key");
// "unknown.key"
```

**主要翻译命名空间：**

---

| 命名空间     | 说明         |
| ------------ | ------------ |
| `common`     | 通用文本     |
| `toolbar`    | 工具栏文本   |
| `link`       | 链接相关文本 |
| `fontFamily` | 字体相关文本 |
| `fontSize`   | 字号相关文本 |
| `alignment`  | 对齐相关文本 |
| `lineHeight` | 行高相关文本 |
| `heading`    | 标题相关文本 |
| `upload`     | 上传相关文本 |
| `media`      | 媒体节点文本 |
| `attachment` | 附件相关文本 |
| `table`      | 表格相关文本 |

---

#### `setLocale(locale)`

切换当前语言。

```typescript
setLocale(locale: Locale): void
```

**参数：**

| 参数     | 类型     | 说明             |
| -------- | -------- | ---------------- |
| `locale` | `Locale` | 已注册的语言标识 |

内置语言：

```typescript
i18n.setLocale("zh-CN");
i18n.setLocale("en");
i18n.setLocale("ja-JP");
```

如果指定的语言尚未注册，则不会进行切换。

```typescript
i18n.setLocale("ko-KR");
// 如果 ko-KR 尚未通过 addMessages() 注册，则不会发生任何变化
```

切换语言后，已经通过 `subscribe()` 注册的订阅者会收到语言变化通知。

---

#### `getLocales()`

获取当前已经注册的所有语言。

```typescript
getLocales(): Locale[]
```

**示例：**

```typescript
const locales = i18n.getLocales();

console.log(locales);
// ["zh-CN", "en", "ja-JP"]
```

如果通过 `addMessages()` 注册了自定义语言：

```typescript
i18n.addMessages("ko-KR", koKR);

console.log(i18n.getLocales());
// ["zh-CN", "en", "ja-JP", "ko-KR"]
```

返回的是新的数组，不会直接修改 i18n 内部的语言注册表。

---

#### `hasLocale(locale)`

判断指定语言是否已经注册。

```typescript
hasLocale(locale: Locale): boolean
```

**示例：**

```typescript
i18n.hasLocale("zh-CN");
// true

i18n.hasLocale("ko-KR");
// false
```

注册自定义语言后：

```typescript
i18n.addMessages("ko-KR", koKR);

i18n.hasLocale("ko-KR");
// true
```

该方法可以用于在调用 `setLocale()` 或 `addMessages()` 前检查语言是否存在。

---

#### `getMessages(locale)`

获取指定语言的消息对象。

```typescript
getMessages(locale: Locale): LocaleMessages | undefined
```

**示例：**

```typescript
const messages = i18n.getMessages("zh-CN");

console.log(messages?.toolbar.bold);
// "粗体"
```

如果指定语言不存在，则返回 `undefined`：

```typescript
const messages = i18n.getMessages("ko-KR");

console.log(messages);
// undefined
```

> **注意：**
> `getMessages()` 返回该语言的完整语言包，包含 `extend()` 持久化的扩展。

---

#### `addMessages(locale, messages)`

注册一个新的语言。

```typescript
addMessages(
  locale: Locale,
  messages: LocaleMessages,
): void
```

该方法**只能注册尚未存在的语言**，不能覆盖已经注册的语言。

因此，内置语言不能通过该方法覆盖：

```typescript
i18n.addMessages("zh-CN", messages);
// ❌ 不允许

i18n.addMessages("en", messages);
// ❌ 不允许

i18n.addMessages("ja-JP", messages);
// ❌ 不允许
```

自定义语言可以正常注册：

```typescript
import koKR from "./locales/ko-KR";

i18n.addMessages("ko-KR", koKR);
```

注册后即可切换：

```typescript
i18n.setLocale("ko-KR");

console.log(i18n.locale);
// "ko-KR"
```

也可以注册其他语言：

```typescript
i18n.addMessages("fr-FR", frFR);
i18n.addMessages("de-DE", deDE);
```

> **注意：**
> `addMessages()` 不会覆盖已经存在的语言，包括通过 `addMessages()` 注册的自定义语言。如果重复注册同一个语言，会抛出异常。

---

#### `extend(messages)`

扩展当前语言的消息对象。

```typescript
extend(
  messages: DeepPartial<LocaleMessages>,
): void
```

该方法使用**深度合并**，只需要提供需要修改或新增的字段。

**示例：**

```typescript
import { i18n } from "@catmasks/free-editor";

i18n.extend({
  toolbar: {
    bold: "自定义粗体",
    italic: "自定义斜体",
  },
});
```

原语言包中其他没有指定的字段会继续保留。

例如：

```typescript
i18n.extend({
  toolbar: {
    bold: "加粗",
  },
});
```

只会修改：

```typescript
toolbar.bold;
```

不会影响：

```typescript
toolbar.italic;
toolbar.underline;
toolbar.strike;
```

> **注意：**
> `extend()` 的扩展会持久化到该语言的完整语言包，调用 `setLocale()` 切走再切回后，修改仍然保留。

---

#### `subscribe(callback)`

订阅语言变化事件。

```typescript
subscribe(
  callback: (locale: Locale) => void,
): () => void
```

当调用 `setLocale()` 切换语言时，所有订阅者都会收到新的语言标识。

**示例：**

```typescript
const unsubscribe = i18n.subscribe((locale) => {
  console.log("语言切换为:", locale);
});

i18n.setLocale("en");
// "语言切换为: en"
```

`subscribe()` 返回一个取消订阅函数：

```typescript
unsubscribe();
```

取消订阅后，该回调将不会再收到语言变化通知。

> **注意：**
> 如果组件或模块不再需要监听语言变化，请及时调用取消订阅函数，以避免不必要的回调和潜在的内存泄漏。

---

### 6.3 自定义语言

Free Editor 支持通过 `addMessages()` 注册自定义语言。

例如添加韩语：

```typescript
import { i18n } from "@catmasks/free-editor";
import koKR from "./locales/ko-KR";

i18n.addMessages("ko-KR", koKR);

i18n.setLocale("ko-KR");

console.log(i18n.locale);
// "ko-KR"
```

注册完成后，可以正常使用：

```typescript
i18n.t("toolbar.bold");
```

也可以通过：

```typescript
i18n.getLocales();
```

获取所有已经注册的语言：

```typescript
["zh-CN", "en", "ja-JP", "ko-KR"];
```

---

### 6.4 API 总览

| API                    | 类型                          | 说明                             |
| ---------------------- | ----------------------------- | -------------------------------- |
| `locale`               | `Locale`                      | 当前语言                         |
| `t()`                  | `string`                      | 获取翻译文本                     |
| `setLocale()`          | `void`                        | 切换当前语言                     |
| `getLocales()`         | `Locale[]`                    | 获取所有已注册语言               |
| `hasLocale()`          | `boolean`                     | 判断语言是否已注册               |
| `getMessages()`        | `LocaleMessages \| undefined` | 获取指定语言的完整语言包（含扩展）     |
| `addMessages()`        | `void`                        | 注册新的语言，不允许覆盖已有语言 |
| `extend()`             | `void`                        | 扩展当前语言消息                 |
| `subscribe()`          | `() => void`                  | 订阅语言变化                     |

### 6.5 内置语言与自定义语言

Free Editor 内置：

```typescript
type BuiltinLocale = "zh-CN" | "en" | "ja-JP";
```

`Locale` 在此基础上支持自定义语言：

```typescript
type Locale = BuiltinLocale | (string & {});
```

因此既可以使用内置语言：

```typescript
i18n.setLocale("zh-CN");
i18n.setLocale("en");
i18n.setLocale("ja-JP");
```

也可以注册并使用自定义语言：

```typescript
i18n.addMessages("ko-KR", koKR);
i18n.setLocale("ko-KR");
```

---

## 🖥️ <a id="ssr-support"></a>7. SSR 支持

FreeEditor 支持在服务端渲染（SSR）环境中安全加载，适用于 Vue SSR、Nuxt、Vite SSR 以及 Node.js 等场景。在服务端 `import` 该 npm 包不会触发任何浏览器专属 API（如 `window`、`document`、`navigator` 等）；浏览器专属逻辑被延迟到真正执行相关功能时，因此不会因服务端加载主入口而报错。

### 7.1 使用原则

在 SSR 环境下使用编辑器时，请遵循以下原则：

- **服务端（SSR 阶段）**：仅安全地 `import` 该包（例如读取类型或 `i18n`），**不要**创建编辑器实例。
- **浏览器端（客户端）**：在组件挂载完成后（如 Vue 的 `onMounted`、React 的 `useEffect`）调用 `new Editor()` 创建编辑器。
- 若在服务端误调用 `new Editor()`，将抛出明确的环境错误提示，以帮助定位问题。
- 导出与导入（如 Word、PDF）所需的重型依赖（`docx`、`mammoth`、`html2canvas`、`jspdf` 等）采用动态 `import()` 按需加载，仅在调用相关功能时才会被加载。

### 7.2 Vue 3 示例

在 Vue 3 中，建议在 `onMounted` 中创建编辑器，并在组件卸载时销毁：

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { Editor } from "@catmasks/free-editor";

let editor: Editor | null = null;
const editorEl = ref<HTMLElement | null>(null);

onMounted(() => {
  // 仅在浏览器端创建编辑器实例
  if (editorEl.value) {
    editor = new Editor(editorEl.value, {
      content: "<p>Hello World</p>",
    });
  }
});

onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
});
</script>

<template>
  <div ref="editorEl"></div>
</template>
```

### 7.3 Nuxt 提示

在使用 Nuxt 时，建议通过内置的 `<ClientOnly>` 组件包裹编辑器，或在 `<script setup>` 中结合 `import.meta.client` 判断，确保编辑器只在客户端渲染与挂载。

### 7.4 纯服务端加载验证

以下示例可运行于 Node.js 环境，验证 SSR 服务端能够安全加载该 npm 包：

```typescript
import { Editor, i18n } from "@catmasks/free-editor";

// 允许在服务端读取语言等信息（不依赖浏览器）
console.log(i18n.locale);

// 若无 DOM，不应在此调用 new Editor()
```

### 7.5 注意事项

- `style.css` 需在客户端单独引入。
- 构建产物中的动态 `chunks/` 目录需与 `index.js` 一起部署。
- 在 SSR 环境引入时，请确保编辑器实例仅在浏览器端创建。

---
