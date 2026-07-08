<h4 align="right"><strong>English</strong> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.ja-JP.md">日本語</a></h4>
<br/>
<p align="center">
  <img src="./playground/src/assets/logo.png" alt="logo">
</p>
<h1 align="center">FreeEditor</h1>
<h4 align="center">A lightweight rich text editor built on the TipTap core</h4>
<h4 align="center">Out-of-the-box, supports all frontend frameworks, built-in Chinese, English, and Japanese</h4>

### Get started and use it

If this helps you, please give us a star so you can be notified when new versions are released.

```bash
npm install @catmasks/free-editor
```

or

```bash
pnpm add @catmasks/free-editor
```

## Navigation

### Built-in Plugins:

`EditorPluginKey`:

| Plugin Key                                                  | Name        | Description                                         |
| ----------------------------------------------------------- | ----------- | --------------------------------------------------- |
| `heading`                                                   | Heading     | Supports H1–H6 headings                             |
| `fontBold`                                                  | Bold        | Toggle bold                                         |
| `fontItalic`                                                | Italic      | Toggle italic                                       |
| `fontColor`                                                 | Font Color  | Set text color                                      |
| `fontHighlight`                                             | Highlight   | Set text background highlight                       |
| `fontFamily`                                                | Font Family | Set font family                                     |
| `fontSize`                                                  | Font Size   | Set font size                                       |
| `link`                                                      | Link        | Insert/edit/remove link                             |
| `codeBlock`                                                 | Code Block  | Insert code block                                   |
| [<span style="color:#4695db">image</span>](#2-media-upload) | Image       | Insert image, supports drag‑and‑drop / paste upload |
| [<span style="color:#4695db">video</span>](#2-media-upload) | Video       | Insert video, supports drag‑and‑drop / paste upload |

### Internationalization:

See [<span style="color:#4695db">Chapter 3 – i18n</span>](#3-internationalizationi18n) for details.

---

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

**Signature:**

```typescript
constructor(el: HTMLElement, options?: EditorOptions)
```

**Parameters:**

| Parameter | Type            | Description                        |
| --------- | --------------- | ---------------------------------- |
| `el`      | `HTMLElement`   | DOM element to mount the editor on |
| `options` | `EditorOptions` | Editor configuration (optional)    |

### 1.3 Configuration Options – `EditorOptions`

#### `content`

```typescript
content?: string
```

Initial HTML content of the editor.

#### `locale`

```typescript
locale?: Locale
```

Initial locale for the editor.

**Default:** `"zh-CN"`  
**Allowed values:** `"zh-CN"` | `"en"` | `"ja-JP"`

#### `theme`

```typescript
theme?: EditorTheme
```

Editor theme.

**Default:** `"light"`  
**Allowed values:** `"light"` | `"dark"`

#### `placeholder`

```typescript
placeholder?: string
```

Placeholder text shown when the editor is empty.

**Default:** `"Please enter content..."`

#### `include`

```typescript
include?: EditorPluginKey[]
```

Only include the specified plugins. If empty, all plugins are included.

**Default:** `[]` (all plugins)

#### `exclude`

```typescript
exclude?: EditorPluginKey[]
```

Exclude the specified plugins.

**Default:** `[]` (none excluded)

#### `uploader`

```typescript
uploader?: MediaUploaderOptions
```

Media upload configuration, supports separate settings for images, videos, and files.  
See [Chapter 2](#2-media-upload) for details.

### 1.4 Instance Properties

#### `isMounted`

Returns whether the editor is mounted.

```typescript
console.log(editor.isMounted); // true
```

#### `isDestroyed`

Returns whether the editor has been destroyed.

```typescript
console.log(editor.isDestroyed); // false
```

#### `theme`

Returns the current theme (`"light"` or `"dark"`).

```typescript
console.log(editor.theme); // "light"
```

#### `isDark`

Returns `true` if dark mode is active.

```typescript
console.log(editor.isDark); // false
```

### 1.5 Instance Methods

#### `setTheme(theme)`

```typescript
setTheme(theme: EditorTheme): void
```

Sets the theme.

**Parameters:**

| Parameter | Type          | Description                       |
| --------- | ------------- | --------------------------------- |
| `theme`   | `EditorTheme` | Theme name: `"light"` or `"dark"` |

#### `toggleTheme()`

```typescript
toggleTheme(): void
```

Toggles between light and dark themes.

#### `getHtml()`

```typescript
getHtml(): string
```

Returns the editor’s HTML content.

**Returns:** `string` – HTML string  
**Throws:** `Error: Editor has been destroyed` if the editor is destroyed.

#### `destroy()`

```typescript
destroy(): void
```

Destroys the editor, cleaning up all resources and event listeners.

---

## 2. Media Upload

### 2.1 `MediaUploaderOptions`

A collection of upload configurations, grouped by media type.

```typescript
interface MediaUploaderOptions {
  image?: MediaUploaderConfig;
  video?: MediaUploaderConfig;
  file?: MediaUploaderConfig;
}
```

**Properties:**

| Property | Type                  | Description         |
| -------- | --------------------- | ------------------- |
| `image`  | `MediaUploaderConfig` | Image upload config |
| `video`  | `MediaUploaderConfig` | Video upload config |
| `file`   | `MediaUploaderConfig` | File upload config  |

### 2.2 `MediaUploaderConfig`

Configuration for a single media type.

#### `action`

```typescript
action?: string
```

Upload endpoint URL.

**Default:** `undefined`

#### `method`

```typescript
method?: string
```

HTTP method.

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

````typescript
accept?: string[]
`

Accepted file MIME types.

#### `data`

```typescript
data?: Record<string, any> | (() => Record<string, any>)
````

Additional form data.

#### `format`

```typescript
format?: (result: any) => UploadResult | Promise<UploadResult>
```

Format the response result.

**Parameters:**

- `result` – The server response

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

Custom upload function. If provided, the default upload logic is replaced.

**Parameters:**

- `file` – The file object
- `context` – Upload context containing `signal`, `config`, and `onProgress`

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

Pre‑upload hook. Return `false` to cancel upload, or return a new `File` to replace the original.

**Example:**

```typescript
{
  beforeUpload: (file) => {
    // Compress image and return
    return compressImage(file);
  },
}
```

#### `validate`

```typescript
validate?: (file: File) => string | void
```

Validate the file. Return an error message string to indicate failure.

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

---

## 3. Internationalization(i18n)

### 3.1 i18n Instance Properties

#### `locale`

The current locale of the instance.

```typescript
console.log(i18n.locale); // zh-CN
```

### 3.2 i18n Instance Methods

#### `t(key, ...args)`

```typescript
t(key: string, ...args: any[]): string
```

Returns the translated text for `key` in the current locale.

**Returns:** `string` – Translated text, or the key itself if not found.

**Parameters:**

| Parameter | Type     | Description                                                               |
| --------- | -------- | ------------------------------------------------------------------------- |
| `key`     | `string` | Message key, supports dot‑path notation, e.g., `"toolbar.bold"`           |
| `args`    | `any[]`  | Optional arguments to replace placeholders `{0}`, `{1}`, … in the message |

**Example:**

```typescript
i18n.t("toolbar.bold");
```

#### `setLocale(locale)`

```typescript
setLocale(locale: Locale): void
```

Sets the locale for the editor instance.

**Parameters:**

| Parameter | Type     | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| `locale`  | `Locale` | Target locale: `"zh-CN"`, `"en"`, or `"ja-JP"` |

#### `extend(messages)`

```typescript
extend(messages: DeepPartial<LocaleMessages>): void
```

Extends the current locale’s message object.

**Parameters:**

| Parameter  | Type                          | Description        |
| ---------- | ----------------------------- | ------------------ |
| `messages` | `DeepPartial<LocaleMessages>` | Messages to extend |

**Note:** This method must be called **before** the editor is initialized; otherwise it has no effect on the editor.

**Example:**

```typescript
i18n.extend({
  toolbar: { bold: "Custom Bold", italic: "Custom Italic", test: "Test Text" },
});
```

#### `subscribe(callback)`

```typescript
subscribe(callback: (locale: Locale) => void): () => void
```

Subscribes to locale change events. Useful for using `i18n` outside the editor.

**Parameters:**

| Parameter  | Type                       | Description                              |
| ---------- | -------------------------- | ---------------------------------------- |
| `callback` | `(locale: Locale) => void` | Callback invoked when the locale changes |

**Returns:** An unsubscribe function.

**Note:** Call the returned unsubscribe function when destroying to prevent memory leaks.

**Example:**

```typescript
let unsubscribeLocale: (() => void) | null = null;
unsubscribeLocale = i18n.subscribe(() => {
  // Handle locale change...
});
// On destroy:
unsubscribeLocale?.();
unsubscribeLocale = null;
```
