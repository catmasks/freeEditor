<h4 align="right"><strong>English</strong> | <a href="./README.zh-CN.md">简体中文</a> | <a href="./README.ja-JP.md">日本語</a></h4>
<br/>
<p align="center">
  <img src="./playground/src/assets/logo.png" alt="logo">
</p>
<h1 align="center">FreeEditor</h1>
<h4 align="center">A Lightweight Rich-Text Editor Built on the TipTap Core</h4>
<h4 align="center">Ready to Use, Supports All Front-End Frameworks, Built-in Chinese, English, and Japanese</h4>
<p align="center">
  <img src="./playground/src/assets/freeEditor.png" alt="freeEditor">
</p>

### Getting Started

If this project has been helpful to you, please consider giving it a star, so that you can be notified when new versions are released.

```bash
npm install @catmasks/free-editor
```

Or

```bash
pnpm add @catmasks/free-editor
```

### CDN Integration

If your project does not use a bundler, you can use the editor directly in the browser via ESM CDN.

> **Note**:
>
> - This package is provided exclusively in ESM format and must be loaded using `<script type="module">`; traditional `<script>` tags are not supported.
> - Since `@tiptap/core`, `@tiptap/pm`, and `@tiptap/extension-gapcursor` are externalized as peerDependencies, you must ensure these dependencies are resolvable when using CDN. Using a CDN that supports automatic dependency resolution, such as esm.sh, eliminates the need for manual configuration.

**Using esm.sh (Recommended)**

```html
<script type="module">
  import { Editor, i18n } from "https://esm.sh/@catmasks/free-editor@0.0.4";
  import "https://esm.sh/@catmasks/free-editor@0.0.4/style.css";

  const editor = new Editor(document.getElementById("editor"), {
    content: "<p>Hello World</p>",
    placeholder: "Please enter content...",
  });
</script>
```

**Using importmap (Optional)**

If you prefer bare import specifiers, you can combine with importmap:

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

**Using jsdelivr / unpkg (Alternative)**

When using jsdelivr or unpkg, you must ensure that peerDependencies are also loaded correctly (using a CDN with automatic resolution like esm.sh is recommended).

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
  // ... use the editor
</script>
```

> **Tip**:
>
> - Please replace `@0.0.4` with the actual version you are using.
> - The stylesheet `style.css` **must be imported separately**; otherwise, the editor will not render correctly.

## Navigation

- [1. Quick Start](#1-quick-start)
- [2. Configuration Options](#2-configuration-options)
- [3. Instance Properties and Methods](#3-instance-properties-and-methods)
- [4. Built-in Plugins](#4-built-in-plugins)
- [5. Media Upload](#5-media-upload)
- [6. Internationalization (i18n)](#6-internationalization-i18n)

---

## 1. Quick Start

### Basic Usage

```typescript
import { Editor } from "@catmasks/free-editor";
import "@catmasks/free-editor/style.css";

// Create the editor
const editor = new Editor(document.getElementById("editor"), {
  content: "<p>Hello World</p>",
  placeholder: "Please enter content...",
});
```

---

## 2. Configuration Options

The second constructor parameter accepts an `EditorOptions` configuration object:

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
}
```

### `content`

Initial content of the editor, provided as an HTML string.

```typescript
content?: string
```

### `locale`

Initial locale for the editor.

- **Default:** `"zh-CN"`
- **Allowed values:** `"zh-CN"` | `"en"` | `"ja-JP"`

```typescript
locale?: Locale
```

### `height`

Initial height of the editor, in pixels.

- **Default:** `undefined`

```typescript
height?: number
```

### `maxHeight`

Maximum height of the editor, in pixels.

- **Default:** `undefined`

```typescript
maxHeight?: number
```

### `theme`

Editor theme.

- **Default:** `"light"`
- **Allowed values:** `"light"` | `"dark"`

```typescript
theme?: EditorTheme
```

### `disabled`

Whether the editor is disabled.

- **Default:** `false`

```typescript
disabled?: boolean
```

### `readonly`

Whether the editor is read-only.

- **Default:** `false`

```typescript
readonly?: boolean
```

### `placeholder`

Placeholder text displayed when the editor is empty.

- **Default:** `"Please enter content..."`

```typescript
placeholder?: string
```

### `include`

Specifies which plugins to include. If empty, all plugins are included.

- **Default:** `[]` (all plugins included)

```typescript
include?: EditorPluginKey[]
```

**Example:** Enable only heading and bold.

```typescript
include: ["heading", "fontBold"];
```

### `exclude`

Specifies which plugins to exclude.

- **Default:** `[]` (no plugins excluded)

```typescript
exclude?: EditorPluginKey[]
```

**Example:** Exclude code block.

```typescript
exclude: ["codeBlock"];
```

### `uploader`

Media upload configuration, supporting independent settings for images, videos, and attachments. See [Chapter 5](#5-media-upload) for details.

```typescript
uploader?: MediaUploaderOptions
```

---

## 3. Instance Properties and Methods

### 3.1 Instance Properties

#### `isMounted`

Returns whether the editor has been mounted.

```typescript
console.log(editor.isMounted); // true
```

#### `isDestroyed`

Returns whether the editor has been destroyed.

```typescript
console.log(editor.isDestroyed); // false
```

#### `theme`

Gets the current theme, returning `"light"` or `"dark"`.

```typescript
console.log(editor.theme); // "light"
```

#### `isDark`

Returns whether the current theme is dark mode.

```typescript
console.log(editor.isDark); // false
```

#### `disabled`

Returns whether the editor is disabled.

```typescript
console.log(editor.disabled); // false
```

#### `readonly`

Returns whether the editor is read-only.

```typescript
console.log(editor.readonly); // false
```

#### `locale`

Gets the current locale.

```typescript
console.log(editor.locale); // "zh-CN"
```

### 3.2 Instance Methods

#### `setTheme(theme)`

Sets the editor theme.

```typescript
setTheme(theme: EditorTheme): void
```

**Parameters:**

| Parameter | Type          | Description                       |
| --------- | ------------- | --------------------------------- |
| `theme`   | `EditorTheme` | Theme name, `"light"` or `"dark"` |

#### `toggleTheme()`

Toggles between light and dark themes.

```typescript
toggleTheme(): void
```

#### `setLocale(locale)`

Sets the editor locale.

```typescript
setLocale(locale: Locale): void
```

**Parameters:**

| Parameter | Type     | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| `locale`  | `Locale` | Target locale: `"zh-CN"`, `"en"`, or `"ja-JP"` |

#### `getHtml()`

Retrieves the editor content as HTML.

```typescript
getHtml(): string
```

#### `getJson()`

Retrieves the editor content as a JSON string.

```typescript
getJson(): string
```

**Returns:** `string` - JSON string

**Throws:** If the editor has been destroyed, throws `Error: Editor has been destroyed`

#### `setDisabled(disabled)`

Sets the editor's disabled state.

```typescript
setDisabled(disabled: boolean): void
```

**Returns:** `void`

#### `setReadonly(readonly)`

Sets the editor's read-only state.

```typescript
setReadonly(readonly: boolean): void
```

**Returns:** `void`

#### `destroy()`

Destroys the editor, cleaning up all resources and event listeners.

```typescript
destroy(): void
```

---

## 4. Built-in Plugins

Below are all available plugin keys (`EditorPluginKey`):

| Plugin Key      | Name          | Description                                                 |
| --------------- | ------------- | ----------------------------------------------------------- |
| `heading`       | Heading       | Supports H1–H6 headings                                     |
| `fontBold`      | Bold          | Toggle bold text                                            |
| `fontItalic`    | Italic        | Toggle italic text                                          |
| `fontColor`     | Font Color    | Set text color                                              |
| `fontHighlight` | Highlight     | Set text background highlight                               |
| `fontFamily`    | Font Family   | Set font family                                             |
| `fontSize`      | Font Size     | Set font size                                               |
| `alignment`     | Alignment     | Align text left, center, or right                           |
| `link`          | Link          | Insert, edit, or remove links                               |
| `codeBlock`     | Code Block    | Insert code blocks                                          |
| `image`         | Image         | Insert images; supports drag-and-drop and paste upload      |
| `video`         | Video         | Insert videos; supports drag-and-drop and paste upload      |
| `attachment`    | Attachment    | Insert attachments; supports drag-and-drop and paste upload |
| `underline`     | Underline     | Underline text                                              |
| `strike`        | Strikethrough | Strike through text                                         |
| `superscript`   | Superscript   | Apply superscript                                           |
| `subscript`     | Subscript     | Apply subscript                                             |
| `orderedList`   | Ordered List  | Insert ordered list                                         |
| `bulletList`    | Bullet List   | Insert unordered list                                       |
| `taskList`      | Task List     | Insert checklist with checkboxes                            |
| `indent`        | Indent        | Increase indentation                                        |
| `outdent`       | Outdent       | Decrease indentation                                        |
| `lineBreak`     | Line Break    | Insert a line break                                         |
| `lineHeight`    | Line Height   | Set paragraph line height                                   |
| `blockquote`    | Blockquote    | Insert a blockquote                                         |
| `divider`       | Divider       | Insert a horizontal divider                                 |
| `inlineCode`    | Inline Code   | Insert inline code (e.g., `code`)                           |

> **Tip:** Use the `include` or `exclude` configuration options to flexibly control which plugins are enabled.

---

## 5. Media Upload

### 5.1 Configuration Structure

Upload configuration is categorized into three media types:

```typescript
interface MediaUploaderOptions {
  image?: MediaUploaderConfig; // Image upload configuration
  video?: MediaUploaderConfig; // Video upload configuration
  attachment?: MediaUploaderConfig; // Attachment upload configuration
}
```

### 5.2 Upload Configuration Items (`MediaUploaderConfig`)

The following configuration items are available for each media type:

#### `action`

Upload endpoint URL.

```typescript
action?: string
```

#### `method`

HTTP request method.

- **Default:** `"POST"`

```typescript
method?: string
```

#### `headers`

Request headers.

```typescript
headers?: HeadersInit
```

#### `withCredentials`

Whether to include credentials (cookies, etc.).

- **Default:** `false`

```typescript
withCredentials?: boolean
```

#### `fieldName`

Form field name for the file.

- **Default:** `"file"`

```typescript
fieldName?: string
```

#### `maxSize`

Maximum file size in bytes.

- **Default:** `Infinity`

```typescript
maxSize?: number
```

#### `accept`

Array of accepted MIME types.

```typescript
accept?: string[]
```

**Example:**

```typescript
accept: ["image/png", "image/jpeg"];
```

#### `data`

Additional form data, either as an object or a function returning an object.

```typescript
data?: Record<string, any> | (() => Record<string, any>)
```

#### `format`

Formats the server response, returning a standard `UploadResult`.

```typescript
format?: (result: any) => UploadResult | Promise<UploadResult>
```

**Example:**

```typescript
format: (response) => ({
  url: response.data.url,
  name: response.data.filename,
});
```

#### `upload`

Custom upload function. When provided, the default upload logic is replaced.

```typescript
upload?: (file: File, context: UploadContext) => Promise<UploadResult>
```

**Parameters:**

- `file` - The file object
- `context` - Upload context, containing `signal` (abort signal), `config` (configuration), and `onProgress` (progress callback)

**Example:**

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

Pre-upload hook. Returning `false` cancels the upload; returning a new `File` object replaces the original file.

```typescript
beforeUpload?: (file: File) => File | false | Promise<File | false>
```

#### `validate`

Validates the file. Returning a string indicates a validation error.

```typescript
validate?: (file: File) => string | void
```

**Example:**

```typescript
validate: (file) => {
  if (file.size > 10 * 1024 * 1024) {
    return "File size must not exceed 10MB.";
  }
};
```

### 5.3 Callback Events

#### `onProgress`

Upload progress callback.

```typescript
onProgress?: (progress: UploadProgress, file: File) => void
```

`UploadProgress` structure:

```typescript
interface UploadProgress {
  loaded: number; // Bytes loaded
  total: number; // Total bytes
  percent: number; // Percentage
}
```

#### `onSuccess`

Upload success callback.

```typescript
onSuccess?: (result: UploadResult, file: File) => void
```

`UploadResult` structure:

```typescript
interface UploadResult {
  url: string; // Resource URL
  name?: string; // File name
}
```

#### `onUploadError`

Upload error callback.

```typescript
onUploadError?: (error: Error, file: File) => void
```

#### `onTypeError`

File type error callback.

```typescript
onTypeError?: (error: Error, file: File) => void
```

#### `onSizeError`

File size error callback.

```typescript
onSizeError?: (error: Error, file: File) => void
```

#### `onValidateError`

Validation error callback.

```typescript
onValidateError?: (error: Error, file: File) => void
```

### 5.4 Complete Example

```typescript
import { Editor, i18n } from "@catmasks/free-editor";
import type { UploadResult, UploadContext } from "@catmasks/free-editor";

const editor = new Editor(document.getElementById("editor"), {
  uploader: {
    // Image upload configuration
    image: {
      maxSize: 5 * 1024 * 1024, // 5MB
      accept: ["image/png", "image/jpeg"],
      async upload(file: File, ctx: UploadContext) {
        return new Promise<UploadResult>((resolve, reject) => {
          // Custom upload logic...
          resolve({ url: "https://example.com/image.png" });
        });
      },
    },
    // Video upload configuration
    video: {
      maxSize: 500 * 1024 * 1024, // 500MB
      accept: ["video/*"],
      onUploadError(error) {
        alert(i18n.t("upload.uploadFailed"));
      },
    },
    // Attachment upload configuration
    attachment: {
      onSuccess(result, file) {
        console.log("Upload successful:", result.url);
      },
    },
  },
});
```

---

## 6. Internationalization (i18n)

`i18n` is a global singleton that manages multilingual support.

```typescript
import { i18n } from "@catmasks/free-editor";
```

### 6.1 Properties

#### `locale`

Current locale.

```typescript
console.log(i18n.locale); // "zh-CN"
```

### 6.2 Methods

#### `t(key, ...args)`

Retrieves the translation for the given `key` in the current locale. Supports placeholder substitution using `{0}`, `{1}`, etc.

```typescript
t(key: string, ...args: any[]): string
```

**Example:**

```typescript
i18n.t("toolbar.bold"); // "Bold"
i18n.t("upload.fileSizeExceeded"); // "File size exceeds limit"
```

**Available translation keys:**

| Namespace    | Description              |
| ------------ | ------------------------ |
| `common`     | Common text              |
| `toolbar`    | Toolbar text             |
| `link`       | Link-related text        |
| `fontFamily` | Font family-related text |
| `fontSize`   | Font size-related text   |
| `alignment`  | Alignment-related text   |
| `heading`    | Heading-related text     |
| `upload`     | Upload-related text      |
| `media`      | Media node text          |
| `attachment` | Attachment-related text  |

#### `setLocale(locale)`

Sets the current locale.

```typescript
setLocale(locale: Locale): void
```

**Parameters:**

| Parameter | Type     | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| `locale`  | `Locale` | Target locale: `"zh-CN"`, `"en"`, or `"ja-JP"` |

#### `extend(messages)`

Extends the current locale's message object (deep merge).

> **Note:** This method must be called before the editor is initialized; otherwise, it will have no effect on the editor.

```typescript
extend(messages: DeepPartial<LocaleMessages>): void
```

**Example:**

```typescript
import { i18n } from "@catmasks/free-editor";

// Extend translations before creating the editor
i18n.extend({
  toolbar: {
    bold: "Custom Bold",
    italic: "Custom Italic",
  },
});

// Then create the editor
const editor = new Editor(...);
```

#### `subscribe(callback)`

Subscribes to locale change events. Returns an unsubscribe function.

> **Note:** Be sure to call the returned unsubscribe function when no longer needed to prevent memory leaks.

```typescript
subscribe(callback: (locale: Locale) => void): () => void
```

**Example:**

```typescript
const unsubscribe = i18n.subscribe((locale) => {
  console.log("Locale changed to:", locale);
});

// Unsubscribe when no longer needed
unsubscribe();
```
