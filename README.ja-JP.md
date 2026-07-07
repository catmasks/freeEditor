<h4 align="right"><a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <strong>日本語</strong></h4>
<br/>
<p align="center">
  <img src="./playground/src/assets/logo.svg" alt="logo">
</p>
<br/>
<h1 align="center">FreeEditor</h1>
<h4 align="center">TipTap コアをベースに構築された軽量リッチテキストエディタ</h4>
<h4 align="center">すぐに使えて、すべてのフロントエンドフレームワークに対応</h4>

### 使い始める前に

このプロジェクトがお役に立つなら、スターを付けてください。新しいバージョンがリリースされた際に通知を受け取ることができます。

```bash
npm install @catmasks/free-editor
```

または

```bash
pnpm add @catmasks/free-editor
```

## ナビゲーション

エディタには以下の組み込みプラグインが含まれています。

`EditorPluginKey`:

| プラグインキー                     | 名称           | 説明                                                               |
| ---------------------------------- | -------------- | ------------------------------------------------------------------ |
| `heading`                          | 見出し         | H1～H6 の見出しに対応                                              |
| `fontBold`                         | 太字           | テキストを太字／標準に切り替え                                     |
| `fontItalic`                       | 斜体           | テキストを斜体／標準に切り替え                                     |
| `fontColor`                        | 文字色         | テキストの色を設定                                                 |
| `fontHighlight`                    | ハイライト     | テキストの背景色（ハイライト）を設定                               |
| `fontFamily`                       | フォント       | フォントファミリを設定                                             |
| `fontSize`                         | フォントサイズ | 文字サイズを設定                                                   |
| `link`                             | リンク         | リンクの挿入／編集／削除                                           |
| `codeBlock`                        | コードブロック | コードブロックを挿入                                               |
| [`image`](#2-メディアアップロード) | 画像           | 画像を挿入（ドラッグ＆ドロップ／ペーストによるアップロードに対応） |
| [`video`](#2-メディアアップロード) | 動画           | 動画を挿入（ドラッグ＆ドロップ／ペーストによるアップロードに対応） |

## 1. クイックスタート

### 1.1 基本的な使い方

```typescript
import { Editor } from "@catmasks/free-editor";
import "@catmasks/free-editor/style.css";

// エディタを作成
const editor = new Editor(document.getElementById("editor"), {
  content: "<p>Hello World</p>",
  placeholder: "内容を入力してください...",
});
```

### 1.2 Editor コンストラクタ

**関数シグネチャ:**

```typescript
constructor(el: HTMLElement, options?: EditorOptions)
```

**パラメータ:**

| パラメータ | 型              | 説明                               |
| ---------- | --------------- | ---------------------------------- |
| `el`       | `HTMLElement`   | エディタをマウントする DOM 要素    |
| `options`  | `EditorOptions` | エディタの設定オプション（省略可） |

### 1.3 設定オプション – EditorOptions

#### `content`

```typescript
content?: string
```

エディタの初期コンテンツ（HTML 文字列）。

**デフォルト:** `undefined`

#### `theme`

```typescript
theme?: EditorTheme
```

エディタのテーマ。

**デフォルト:** `"light"`

**指定可能な値:** `"light"` | `"dark"`

#### `placeholder`

```typescript
placeholder?: string
```

エディタが空の場合に表示されるプレースホルダーテキスト。

**デフォルト:** `"内容を入力してください..."`

#### `include`

```typescript
include?: EditorPluginKey[]
```

指定したプラグインのみを含めます。空の場合はすべてのプラグインを含みます。

**デフォルト:** `[]`（すべてのプラグインを含む）

#### `exclude`

```typescript
exclude?: EditorPluginKey[]
```

指定したプラグインを除外します。

**デフォルト:** `[]`（除外なし）

#### `uploader`

```typescript
uploader?: MediaUploaderOptions
```

メディアアップロードの設定。画像・動画・ファイルの各タイプを個別に設定できます。
詳細は [第2章](#2-メディアアップロード) を参照してください。

### 1.4 インスタンスプロパティ

#### `isMounted`

エディタがマウントされているかどうかを確認します。

```typescript
console.log(editor.isMounted); // true
```

#### `isDestroyed`

エディタが破棄されているかどうかを確認します。

```typescript
console.log(editor.isDestroyed); // false
```

#### `theme`

現在のテーマを取得します。`"light"` または `"dark"` を返します。

```typescript
console.log(editor.theme); // "light"
```

#### `isDark`

ダークモードが有効かどうか。

```typescript
console.log(editor.isDark); // false
```

### 1.5 インスタンスメソッド

#### `setTheme(theme)`

```typescript
setTheme(theme: EditorTheme): void
```

テーマを設定します。

**パラメータ:**

| パラメータ | 型            | 説明                                  |
| ---------- | ------------- | ------------------------------------- |
| `theme`    | `EditorTheme` | テーマ名（`"light"` または `"dark"`） |

#### `toggleTheme()`

```typescript
toggleTheme(): void
```

ライトテーマとダークテーマを切り替えます。

#### `getHtml()`

```typescript
getHtml(): string
```

エディタの HTML コンテンツを取得します。

**戻り値:** `string` – HTML 文字列

**例外:** エディタが破棄されている場合は `Error: Editor has been destroyed` をスローします。

#### `destroy()`

```typescript
destroy(): void
```

エディタを破棄し、すべてのリソースとイベントリスナーをクリーンアップします。

## 2. メディアアップロード

### 2.1 MediaUploaderOptions

アップロード設定のコレクション。メディアタイプごとに設定します。

```typescript
interface MediaUploaderOptions {
  image?: MediaUploaderConfig;
  video?: MediaUploaderConfig;
  file?: MediaUploaderConfig;
}
```

**プロパティの説明:**

| プロパティ | 型                    | 説明                     |
| ---------- | --------------------- | ------------------------ |
| `image`    | `MediaUploaderConfig` | 画像アップロード設定     |
| `video`    | `MediaUploaderConfig` | 動画アップロード設定     |
| `file`     | `MediaUploaderConfig` | ファイルアップロード設定 |

### 2.2 MediaUploaderConfig

単一メディアタイプのアップロード設定。

#### `action`

```typescript
action?: string
```

アップロード先 URL。

**デフォルト:** `undefined`

#### `method`

```typescript
method?: string
```

リクエストメソッド。

**デフォルト:** `"POST"`

#### `headers`

```typescript
headers?: HeadersInit
```

リクエストヘッダー。

#### `withCredentials`

```typescript
withCredentials?: boolean
```

クレデンシャル（Cookie など）を送信するかどうか。

**デフォルト:** `false`

#### `fieldName`

```typescript
fieldName?: string
```

フォームフィールド名。

**デフォルト:** `"file"`

#### `maxSize`

```typescript
maxSize?: number
```

最大ファイルサイズ（バイト単位）。

**デフォルト:** `Infinity`

#### `accept`

```typescript
accept?: string[]
```

許可するファイルタイプ。

#### `data`

```typescript
data?: Record<string, any> | (() => Record<string, any>)
```

追加のフォームデータ。

#### `format`

```typescript
format?: (result: any) => UploadResult | Promise<UploadResult>
```

レスポンス結果を整形します。

**パラメータ:**

- `result` – サーバーレスポンス

**戻り値:** `UploadResult` – 整形されたアップロード結果

**例:**

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

カスタムアップロード関数。設定すると、デフォルトのアップロードロジックが置き換えられます。

**パラメータ:**

- `file` – ファイルオブジェクト
- `context` – アップロードコンテキスト（`signal`、`config`、`onProgress` を含む）

**戻り値:** `Promise<UploadResult>` – アップロード結果

**例:**

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

アップロード前フック。`false` を返すとアップロードをキャンセルし、新しい `File` オブジェクトを返すとファイルを置き換えます。

**例:**

```typescript
{
  beforeUpload: (file) => {
    // 画像を圧縮して返す
    return compressImage(file);
  },
}
```

#### `validate`

```typescript
validate?: (file: File) => string | void
```

ファイルを検証します。エラーメッセージ文字列を返すと検証失敗を示します。

**例:**

```typescript
{
  validate: (file) => {
    if (file.size > 10 * 1024 * 1024) {
      return "ファイルサイズは 10MB を超えることはできません";
    }
  },
}
```

#### `onProgress`

```typescript
onProgress?: (progress: UploadProgress, file: File) => void
```

進捗コールバック。

#### `onSuccess`

```typescript
onSuccess?: (result: UploadResult, file: File) => void
```

成功コールバック。

#### `onUploadError`

```typescript
onUploadError?: (error: Error, file: File) => void
```

アップロードエラーコールバック。

#### `onTypeError`

```typescript
onTypeError?: (error: Error, file: File) => void
```

ファイルタイプエラーコールバック。

#### `onSizeError`

```typescript
onSizeError?: (error: Error, file: File) => void
```

ファイルサイズエラーコールバック。

#### `onValidateError`

```typescript
onValidateError?: (error: Error, file: File) => void
```

検証エラーコールバック。
