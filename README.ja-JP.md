<h4 align="right"><a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <strong>日本語</strong></h4>
<br/>
<p align="center">
  <img src="./playground/src/assets/logo.png" alt="logo">
</p>
<h1 align="center">FreeEditor</h1>
<h4 align="center">TipTap コアをベースに開発された軽量リッチテキストエディタ</h4>
<h4 align="center">プラグイン不要ですぐに使え、すべてのフロントエンドフレームワークに対応。中国語・英語・日本語を標準搭載</h4>

### 注目して使い始める

お役に立てたなら、スターを付けてください。新バージョンがリリースされたときに通知を受け取れます。

```bash
npm install @catmasks/free-editor
```

または

```bash
pnpm add @catmasks/free-editor
```

## ナビゲーション

### 内蔵プラグイン：

`EditorPluginKey`:

| プラグインキー                                                      | 名前           | 説明                                                               |
| ------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------ |
| `heading`                                                           | 見出し         | H1～H6 見出しに対応                                                |
| `fontBold`                                                          | 太字           | 太字の切り替え                                                     |
| `fontItalic`                                                        | 斜体           | 斜体の切り替え                                                     |
| `fontColor`                                                         | 文字色         | 文字色を設定                                                       |
| `fontHighlight`                                                     | ハイライト     | 背景ハイライトを設定                                               |
| `fontFamily`                                                        | フォント       | フォントファミリを設定                                             |
| `fontSize`                                                          | フォントサイズ | 文字サイズを設定                                                   |
| `link`                                                              | リンク         | リンクの挿入・編集・削除                                           |
| `codeBlock`                                                         | コードブロック | コードブロックを挿入                                               |
| [<span style="color:#4695db">image</span>](#2-メディアアップロード) | 画像           | 画像を挿入（ドラッグ＆ドロップ／貼り付けによるアップロードに対応） |
| [<span style="color:#4695db">video</span>](#2-メディアアップロード) | 動画           | 動画を挿入（ドラッグ＆ドロップ／貼り付けによるアップロードに対応） |

### 国際化（i18n）:

詳細は [<span style="color:#4695db">第3章 – i18n</span>](#3-国際化i18n) をご参照ください。

---

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

**シグネチャ:**

```typescript
constructor(el: HTMLElement, options?: EditorOptions)
```

**パラメータ:**

| パラメータ | 型              | 説明                            |
| ---------- | --------------- | ------------------------------- |
| `el`       | `HTMLElement`   | エディタをマウントする DOM 要素 |
| `options`  | `EditorOptions` | エディタ設定（省略可能）        |

### 1.3 設定項目 – `EditorOptions`

#### `content`

```typescript
content?: string
```

エディタの初期内容（HTML 文字列）。

#### `locale`

```typescript
locale?: Locale
```

エディタの初期ロケール。

**デフォルト:** `"zh-CN"`  
**指定可能な値:** `"zh-CN"` | `"en"` | `"ja-JP"`

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

エディタが空の場合に表示されるプレースホルダー文。

**デフォルト:** `"内容を入力してください..."`

#### `include`

```typescript
include?: EditorPluginKey[]
```

指定したプラグインのみを含めます。空の場合はすべてのプラグインを含みます。

**デフォルト:** `[]`（すべてのプラグイン）

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

メディアアップロード設定。画像・動画・ファイルの各タイプごとに個別に設定できます。  
詳細は [第2章](#2-メディアアップロード) をご参照ください。

### 1.4 インスタンスプロパティ

#### `isMounted`

エディタがマウントされているかどうかを取得します。

```typescript
console.log(editor.isMounted); // true
```

#### `isDestroyed`

エディタが破棄されているかどうかを取得します。

```typescript
console.log(editor.isDestroyed); // false
```

#### `theme`

現在のテーマを取得します。`"light"` または `"dark"` を返します。

```typescript
console.log(editor.theme); // "light"
```

#### `isDark`

ダークモードかどうかを返します。

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

| パラメータ | 型            | 説明                                |
| ---------- | ------------- | ----------------------------------- |
| `theme`    | `EditorTheme` | テーマ名: `"light"` または `"dark"` |

#### `toggleTheme()`

```typescript
toggleTheme(): void
```

テーマを切り替えます（ライト／ダーク）。

#### `getHtml()`

```typescript
getHtml(): string
```

エディタの HTML 内容を取得します。

**戻り値:** `string` – HTML 文字列  
**スロー:** エディタが破棄されている場合は `Error: Editor has been destroyed` をスローします。

#### `destroy()`

```typescript
destroy(): void
```

エディタを破棄し、すべてのリソースとイベントリスナーをクリーンアップします。

---

## 2. メディアアップロード

### 2.1 `MediaUploaderOptions`

アップロード設定の集合。メディアタイプごとに設定します。

```typescript
interface MediaUploaderOptions {
  image?: MediaUploaderConfig;
  video?: MediaUploaderConfig;
  file?: MediaUploaderConfig;
}
```

**プロパティ:**

| プロパティ | 型                    | 説明                     |
| ---------- | --------------------- | ------------------------ |
| `image`    | `MediaUploaderConfig` | 画像アップロード設定     |
| `video`    | `MediaUploaderConfig` | 動画アップロード設定     |
| `file`     | `MediaUploaderConfig` | ファイルアップロード設定 |

### 2.2 `MediaUploaderConfig`

単一メディアタイプのアップロード設定。

#### `action`

```typescript
action?: string
```

アップロード先の URL。

**デフォルト:** `undefined`

#### `method`

```typescript
method?: string
```

HTTP メソッド。

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

フォームのフィールド名。

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

受け付けるファイルの MIME タイプ。

#### `data`

```typescript
data?: Record<string, any> | (() => Record<string, any>)
```

追加のフォームデータ。

#### `format`

```typescript
format?: (result: any) => UploadResult | Promise<UploadResult>
```

サーバーレスポンスを整形します。

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

カスタムアップロード関数。設定するとデフォルトのアップロードロジックが置き換えられます。

**パラメータ:**

- `file` – ファイルオブジェクト
- `context` – `signal`、`config`、`onProgress` を含むアップロードコンテキスト

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

アップロード前のフック。`false` を返すとアップロードをキャンセルし、新しい `File` オブジェクトを返すとファイルを置き換えます。

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

ファイルを検証します。エラーメッセージ文字列を返すと検証失敗とみなします。

**例:**

```typescript
{
  validate: (file) => {
    if (file.size > 10 * 1024 * 1024) {
      return "ファイルサイズは 10MB を超えられません";
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

---

## 3. 国際化（i18n）

### 3.1 i18n インスタンスプロパティ

#### `locale`

現在のインスタンスのロケール。

```typescript
console.log(i18n.locale); // zh-CN
```

### 3.2 i18n インスタンスメソッド

#### `t(key, ...args)`

```typescript
t(key: string, ...args: any[]): string
```

現在のロケールにおける `key` に対応する翻訳テキストを返します。

**戻り値:** `string` – 翻訳後のテキスト。見つからない場合は `key` そのものを返します。

**パラメータ:**

| パラメータ | 型       | 説明                                                                  |
| ---------- | -------- | --------------------------------------------------------------------- |
| `key`      | `string` | メッセージキー。ドット区切りパスに対応（例: `"toolbar.bold"`）        |
| `args`     | `any[]`  | オプションの引数。メッセージ内のプレースホルダ `{0}`, `{1}`, … を置換 |

**例:**

```typescript
i18n.t("toolbar.bold");
```

#### `setLocale(locale)`

```typescript
setLocale(locale: Locale): void
```

エディタインスタンスのロケールを設定します。

**パラメータ:**

| パラメータ | 型       | 説明                                       |
| ---------- | -------- | ------------------------------------------ |
| `locale`   | `Locale` | 対象ロケール: `"zh-CN"`、`"en"`、`"ja-JP"` |

#### `extend(messages)`

```typescript
extend(messages: DeepPartial<LocaleMessages>): void
```

現在のロケールのメッセージオブジェクトを拡張します。

**パラメータ:**

| パラメータ | 型                            | 説明                           |
| ---------- | ----------------------------- | ------------------------------ |
| `messages` | `DeepPartial<LocaleMessages>` | 拡張するメッセージオブジェクト |

**注意:** このメソッドはエディタの初期化**前**に呼び出す必要があります。初期化後に呼び出してもエディタには反映されません。

**例:**

```typescript
i18n.extend({
  toolbar: {
    bold: "カスタム太字",
    italic: "カスタム斜体",
    test: "テストテキスト",
  },
});
```

#### `subscribe(callback)`

```typescript
subscribe(callback: (locale: Locale) => void): () => void
```

ロケール変更イベントを購読します。エディタ外部で `i18n` を使用する際に便利です。

**パラメータ:**

| パラメータ | 型                         | 説明                                 |
| ---------- | -------------------------- | ------------------------------------ |
| `callback` | `(locale: Locale) => void` | ロケール変更時に呼ばれるコールバック |

**戻り値:** 購読を解除する関数

**注意:** 破棄時に返された購読解除関数を呼び出して、メモリリークを防止してください。

**例:**

```typescript
let unsubscribeLocale: (() => void) | null = null;
unsubscribeLocale = i18n.subscribe(() => {
  // ロケール変更後の処理...
});
// 破棄時
unsubscribeLocale?.();
unsubscribeLocale = null;
```
