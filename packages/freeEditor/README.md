<h4 align="right"><strong>English</strong> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.ja-JP.md">日本語</a></h4>
<br/>
<p align="center">
  <img src="./playground/src/assets/logo.png" alt="logo">
</p>
<h1 align="center">FreeEditor</h1>
<h4 align="center">A lightweight rich text editor built on the TipTap core</h4>
<h4 align="center">Ready to use, supports all frontend frameworks</h4>

### Start following and using

If this helps you, please give us a star so you can be notified when new versions are released.

```bash
npm install @catmasks/free-editor
```

Or

```bash
pnpm add @catmasks/free-editor
```

## Navigation

The editor comes with the following built-in plugins:

`EditorPluginKey`:

| Plugin Key                 | Name        | Description                                          |
| -------------------------- | ----------- | ---------------------------------------------------- |
| `heading`                  | Heading     | Supports H1–H6 headings                              |
| `fontBold`                 | Bold        | Bold / un‑bold text                                  |
| `fontItalic`               | Italic      | Italicise / un‑italicise text                        |
| `fontColor`                | Font Color  | Set text color                                       |
| `fontHighlight`            | Highlight   | Set text background highlight                        |
| `fontFamily`               | Font Family | Set font family                                      |
| `fontSize`                 | Font Size   | Set font size                                        |
| `link`                     | Link        | Insert / edit / remove links                         |
| `codeBlock`                | Code Block  | Insert code blocks                                   |
| [`image`](#2-media-upload) | Image       | Insert images, supports drag‑and‑drop / paste upload |
| [`video`](#2-media-upload) | Video       | Insert videos, supports drag‑and‑drop / paste upload |

## 1. Quick Start

### 1.1 Basic Usage

```typescript
import { Editor } from "@catmasks/free-editor";
import "@catmasks/free-editor/style.css";

// Create the editor
const editor = new Editor(document.getElementById("editor"), {
  content: "<p>Hello World</p>",
  placeholder: "Please enter content...",
});
```

### 1.2 Editor Constructor

**Function signature:**

```typescript
constructor(el: HTMLElement, options?: EditorOptions)
```

**Parameters:**

| Parameter | Type            | Description                             |
| --------- | --------------- | --------------------------------------- |
| `el`      | `HTMLElement`   | DOM element to mount the editor on      |
| `options` | `EditorOptions` | Editor configuration options (optional) |

### 1.3 Configuration Options – EditorOptions

#### `content`

```typescript
content?: string
```

Initial editor content as an HTML string.

**Default:** `undefined`

#### `theme`

```typescript
theme?: EditorTheme
```

Editor theme.

**Default:** `"light"`

**Possible values:** `"light"` | `"dark"`

#### `placeholder`

```typescript
placeholder?: string
```

Placeholder text displayed when the editor is empty.

**Default:** `"Please enter content..."`

#### `include`

```typescript
include?: EditorPluginKey[]
```

Only include the specified plugins. If empty, all plugins are included.

**Default:** `[]` (includes all plugins)

#### `exclude`

```typescript
exclude?: EditorPluginKey[]
```

Exclude the specified plugins.

**Default:** `[]` (excludes no plugins)

#### `uploader`

```typescript
uploader?: MediaUploaderOptions
```

Media upload configuration, supporting independent settings for images, videos, and files.
See [Chapter 2](#2-media-upload) for detailed configuration.

### 1.4 Instance Properties

#### `isMounted`

Check whether the editor is mounted.

```typescript
console.log(editor.isMounted); // true
```

#### `isDestroyed`

Check whether the editor has been destroyed.

```typescript
console.log(editor.isDestroyed); // false
```

#### `theme`

Get the current theme. Returns `"light"` or `"dark"`.

```typescript
console.log(editor.theme); // "light"
```

#### `isDark`

Whether dark mode is active.

```typescript
console.log(editor.isDark); // false
```

### 1.5 Instance Methods

#### `setTheme(theme)`

```typescript
setTheme(theme: EditorTheme): void
```

Set the theme.

**Parameters:**

| Parameter | Type          | Description                       |
| --------- | ------------- | --------------------------------- |
| `theme`   | `EditorTheme` | Theme name, `"light"` or `"dark"` |

#### `toggleTheme()`

```typescript
toggleTheme(): void
```

Toggle between light and dark themes.

#### `getHtml()`

```typescript
getHtml(): string
```

Get the editor’s HTML content.

**Returns:** `string` – HTML string

**Throws:** If the editor has been destroyed, throws `Error: Editor has been destroyed`

#### `destroy()`

```typescript
destroy(): void
```

Destroy the editor, cleaning up all resources and event listeners.

## 2. Media Upload

### 2.1 MediaUploaderOptions

Upload configuration collection, configured per media type.

```typescript
interface MediaUploaderOptions {
  image?: MediaUploaderConfig;
  video?: MediaUploaderConfig;
  file?: MediaUploaderConfig;
}
```

**Property descriptions:**

| Property | Type                  | Description         |
| -------- | --------------------- | ------------------- |
| `image`  | `MediaUploaderConfig` | Image upload config |
| `video`  | `MediaUploaderConfig` | Video upload config |
| `file`   | `MediaUploaderConfig` | File upload config  |

### 2.2 MediaUploaderConfig

Upload configuration for a single media type.

#### `action`

```typescript
action?: string
```

Upload URL.

**Default:** `undefined`

#### `method`

```typescript
method?: string
```

Request method.

**Default:** `"POST"`

#### `headers`

```typescript
headers?: HeadersInit
```

Request headers.

#### `withCredentials`

```typescript
withCredentials?: boolean
```

Whether to send credentials (cookies, etc.).

**Default:** `false`

#### `fieldName`

```typescript
fieldName?: string
```

Form field name.

**Default:** `"file"`

#### `maxSize`

```typescript
maxSize?: number
```

Maximum file size in bytes.

**Default:** `Infinity`

#### `accept`

```typescript
accept?: string[]
```

Accepted file types.

#### `data`

```typescript
data?: Record<string, any> | (() => Record<string, any>)
```

Additional form data.

#### `format`

```typescript
format?: (result: any) => UploadResult | Promise<UploadResult>
```

Format the response result.

**Parameters:**

- `result` – Server response

**Returns:** `UploadResult` – Formatted upload result

**Example:**

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

Custom upload function. If set, the default upload logic is replaced.

**Parameters:**

- `file` – The file object
- `context` – Upload context, containing `signal`, `config`, and `onProgress`

**Returns:** `Promise<UploadResult>` – Upload result

**Example:**

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

    context.onProgress?.({ percent: 100 });

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

Pre‑upload hook. Return `false` to cancel upload, or return a new `File` object to replace the file.

**Example:**

```typescript
{
  beforeUpload: (file) => {
    // Compress image then return
    return compressImage(file);
  },
}
```

#### `validate`

```typescript
validate?: (file: File) => string | void
```

Validate the file. Return an error message string to indicate validation failure.

**Example:**

```typescript
{
  validate: (file) => {
    if (file.size > 10 * 1024 * 1024) {
      return "File cannot exceed 10MB";
    }
  },
}
```

#### `onProgress`

```typescript
onProgress?: (progress: UploadProgress, file: File) => void
```

Progress callback.

#### `onSuccess`

```typescript
onSuccess?: (result: UploadResult, file: File) => void
```

Success callback.

#### `onUploadError`

```typescript
onUploadError?: (error: Error, file: File) => void
```

Upload error callback.

#### `onTypeError`

```typescript
onTypeError?: (error: Error, file: File) => void
```

File type error callback.

#### `onSizeError`

```typescript
onSizeError?: (error: Error, file: File) => void
```

File size error callback.

#### `onValidateError`

```typescript
onValidateError?: (error: Error, file: File) => void
```

Validation error callback.
