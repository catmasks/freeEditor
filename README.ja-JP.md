<h4 align="right"><a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <strong>日本語</strong></h4>
<br/>
<p align="center">
  <img src="./playground/src/assets/logo.png" alt="logo">
</p>
<h1 align="center">FreeEditor</h1>
<h4 align="center">TipTap コアをベースに開発された軽量リッチテキストエディタ</h4>
<h4 align="center">プラグイン不要で即利用可能、あらゆるフロントエンドフレームワークに対応、日本語・中国語・英語を内蔵</h4>
<p align="center">
  <img src="./playground/src/assets/freeEditor.png" alt="freeEditor">
</p>

### はじめに

本プロジェクトがお役に立ちましたら、スター（Star）をお願いいたします。新バージョン公開時に通知を受け取ることができます。

```bash
npm install @catmasks/free-editor
```

または

```bash
pnpm add @catmasks/free-editor
```

### CDN による導入

バンドルツールを使用しないプロジェクトでは、ESM CDN を介してブラウザで直接利用することが可能です。

> **注意**：
>
> - 本パッケージは ESM 形式のみを提供しております。従来の `<script>` タグによる読み込みはサポートされておらず、`<script type="module">` 方式での読み込みが必須です。
> - `@tiptap/core`、`@tiptap/pm`、`@tiptap/extension-gapcursor` は peerDependencies として外部化されているため、CDN 導入時にはこれらの依存関係が解決可能であることをご確認ください。esm.sh など、依存関係を自動解決する CDN をご利用いただくと、手動設定が不要となります。

**esm.sh の利用（推奨）**

```html
<script type="module">
  import { Editor, i18n } from "https://esm.sh/@catmasks/free-editor@0.0.4";
  import "https://esm.sh/@catmasks/free-editor@0.0.4/style.css";

  const editor = new Editor(document.getElementById("editor"), {
    content: "<p>Hello World</p>",
    placeholder: "内容を入力してください...",
  });
</script>
```

**importmap の利用（任意）**

ベアインポート形式をご希望の場合は、importmap と併用できます。

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

**jsdelivr / unpkg の利用（代替案）**

jsdelivr または unpkg を利用する場合、peerDependencies も正しく読み込まれるようご注意ください（自動解決機能を持つ esm.sh の利用を推奨いたします）。

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
  // ... エディタを使用
</script>
```

> **補足**：
>
> - `@0.0.4` の部分は、実際にご利用のバージョン番号に置き換えてください。
> - スタイルシート `style.css` は**必ず個別にインポート**してください。インポートされない場合、エディタが正しく表示されません。

## 目次

- [1. クイックスタート](#1-クイックスタート)
- [2. 設定オプション](#2-設定オプション)
- [3. インスタンスプロパティとメソッド](#3-インスタンスプロパティとメソッド)
- [4. 内蔵プラグイン](#4-内蔵プラグイン)
- [5. メディアアップロード](#5-メディアアップロード)
- [6. 国際化 (i18n)](#6-国際化-i18n)

---

## 1. クイックスタート

### 基本的な使用方法

```typescript
import { Editor } from "@catmasks/free-editor";
import "@catmasks/free-editor/style.css";

// エディタを作成
const editor = new Editor(document.getElementById("editor"), {
  content: "<p>Hello World</p>",
  placeholder: "内容を入力してください...",
});
```

---

## 2. 設定オプション

コンストラクタの第2引数には `EditorOptions` 設定オブジェクトを渡します。

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

エディタの初期化コンテンツ（HTML 文字列）です。

```typescript
content?: string
```

### `locale`

エディタの初期言語を設定します。

- **デフォルト値：** `"zh-CN"`
- **指定可能な値：** `"zh-CN"` | `"en"` | `"ja-JP"`

```typescript
locale?: Locale
```

### `height`

エディタの初期高さを設定します。

- **デフォルト値：** `undefined`

```typescript
height?: number
```

### `maxHeight`

エディタの最大高さを設定します。

- **デフォルト値：** `undefined`

```typescript
maxHeight?: number
```

### `theme`

エディタのテーマを設定します。

- **デフォルト値：** `"light"`
- **指定可能な値：** `"light"` | `"dark"`

```typescript
theme?: EditorTheme
```

### `disabled`

エディタを無効（無効化）にするかどうかを指定します。

- **デフォルト値：** `false`

```typescript
disabled?: boolean
```

### `readonly`

エディタを読み取り専用にするかどうかを指定します。

- **デフォルト値：** `false`

```typescript
readonly?: boolean
```

### `placeholder`

プレースホルダーテキストです。エディタが空の場合に表示されます。

- **デフォルト値：** `"内容を入力してください..."`

```typescript
placeholder?: string
```

### `include`

有効化するプラグインを指定します。空の場合は全プラグインが有効となります。

- **デフォルト値：** `[]`（全プラグインを有効）

```typescript
include?: EditorPluginKey[]
```

**例：** 見出しと太字のみを有効にする

```typescript
include: ["heading", "fontBold"];
```

### `exclude`

除外するプラグインを指定します。

- **デフォルト値：** `[]`（除外なし）

```typescript
exclude?: EditorPluginKey[]
```

**例：** コードブロックを除外する

```typescript
exclude: ["codeBlock"];
```

### `uploader`

メディアアップロードの設定です。画像・動画・添付ファイルの各メディア種別ごとに個別に設定可能です。詳細は [第5章](#5-メディアアップロード) をご参照ください。

```typescript
uploader?: MediaUploaderOptions
```

---

## 3. インスタンスプロパティとメソッド

### 3.1 インスタンスプロパティ

#### `isMounted`

エディタがマウント済みかどうかを取得します。

```typescript
console.log(editor.isMounted); // true
```

#### `isDestroyed`

エディタが破棄済みかどうかを取得します。

```typescript
console.log(editor.isDestroyed); // false
```

#### `theme`

現在のテーマを取得します。戻り値は `"light"` または `"dark"` です。

```typescript
console.log(editor.theme); // "light"
```

#### `isDark`

ダークモードかどうかを取得します。

```typescript
console.log(editor.isDark); // false
```

#### `disabled`

エディタが無効化されているかどうかを取得します。

```typescript
console.log(editor.disabled); // false
```

#### `readonly`

エディタが読み取り専用かどうかを取得します。

```typescript
console.log(editor.readonly); // false
```

#### `locale`

現在の言語を取得します。

```typescript
console.log(editor.locale); // "zh-CN"
```

### 3.2 インスタンスメソッド

#### `setTheme(theme)`

テーマを設定します。

```typescript
setTheme(theme: EditorTheme): void
```

**引数：**

| 引数    | 型            | 説明                               |
| ------- | ------------- | ---------------------------------- |
| `theme` | `EditorTheme` | テーマ名 `"light"` または `"dark"` |

#### `toggleTheme()`

テーマを切り替えます（ライト／ダーク）。

```typescript
toggleTheme(): void
```

#### `setLocale(locale)`

エディタの言語を設定します。

```typescript
setLocale(locale: Locale): void
```

**引数：**

| 引数     | 型       | 説明                                    |
| -------- | -------- | --------------------------------------- |
| `locale` | `Locale` | 対象言語 `"zh-CN"` / `"en"` / `"ja-JP"` |

#### `getHtml()`

エディタの HTML コンテンツを取得します。

```typescript
getHtml(): string
```

#### `getJson()`

エディタの JSON コンテンツを取得します。

```typescript
getJson(): string
```

**戻り値：** `string` - JSON 文字列

**例外：** エディタが破棄済みの場合、`Error: Editor has been destroyed` をスローします。

#### `setDisabled(disabled)`

エディタの無効状態を設定します。

```typescript
setDisabled(disabled: boolean): void
```

**戻り値：** `void`

#### `setReadonly(readonly)`

エディタの読み取り専用状態を設定します。

```typescript
setReadonly(readonly: boolean): void
```

**戻り値：** `void`

#### `destroy()`

エディタを破棄し、すべてのリソースおよびイベントリスナーをクリーンアップします。

```typescript
destroy(): void
```

---

## 4. 内蔵プラグイン

以下は利用可能な全プラグインキー（`EditorPluginKey`）の一覧です。

| プラグインキー  | 名称             | 説明                                                           |
| --------------- | ---------------- | -------------------------------------------------------------- |
| `heading`       | 見出し           | H1〜H6 見出しに対応                                            |
| `fontBold`      | 太字             | 文字の太字／解除                                               |
| `fontItalic`    | 斜体             | 文字の斜体／解除                                               |
| `fontColor`     | 文字色           | 文字色を設定                                                   |
| `fontHighlight` | ハイライト       | 文字の背景ハイライトを設定                                     |
| `fontFamily`    | フォント         | フォントを設定                                                 |
| `fontSize`      | フォントサイズ   | 文字サイズを設定                                               |
| `alignment`     | 配置             | 左揃え／中央揃え／右揃え                                       |
| `link`          | リンク           | リンクの挿入／編集／削除                                       |
| `codeBlock`     | コードブロック   | コードブロックを挿入                                           |
| `image`         | 画像             | 画像を挿入（ドラッグ＆ペーストによるアップロード対応）         |
| `video`         | 動画             | 動画を挿入（ドラッグ＆ペーストによるアップロード対応）         |
| `attachment`    | 添付ファイル     | 添付ファイルを挿入（ドラッグ＆ペーストによるアップロード対応） |
| `underline`     | 下線             | 文字に下線を付与                                               |
| `strike`        | 打消し線         | 文字に打消し線を付与                                           |
| `superscript`   | 上付き文字       | 文字を上付きに                                                 |
| `subscript`     | 下付き文字       | 文字を下付きに                                                 |
| `orderedList`   | 番号付きリスト   | 番号付きリストを挿入                                           |
| `bulletList`    | 箇条書きリスト   | 箇条書きリストを挿入                                           |
| `taskList`      | タスクリスト     | チェックボックス付きタスクリストを挿入                         |
| `indent`        | インデント       | インデントを増やす                                             |
| `outdent`       | インデント解除   | インデントを減らす                                             |
| `lineBreak`     | 改行             | 改行を挿入                                                     |
| `lineHeight`    | 行高             | 段落の行高を設定                                               |
| `blockquote`    | 引用             | 引用ブロックを挿入                                             |
| `divider`       | 区切り線         | 水平区切り線を挿入                                             |
| `inlineCode`    | インラインコード | インラインコード（例：`code`）を挿入                           |

> **補足：** `include` または `exclude` 設定オプションを利用することで、有効化するプラグインを柔軟に制御できます。

---

## 5. メディアアップロード

### 5.1 設定構造

アップロード設定はメディア種別ごとに3種類に分類されます。

```typescript
interface MediaUploaderOptions {
  image?: MediaUploaderConfig; // 画像アップロード設定
  video?: MediaUploaderConfig; // 動画アップロード設定
  attachment?: MediaUploaderConfig; // 添付ファイルアップロード設定
}
```

### 5.2 アップロード設定項目 (`MediaUploaderConfig`)

以下は各メディア種別で設定可能な全項目です。

#### `action`

アップロード先の URL です。

```typescript
action?: string
```

#### `method`

HTTP メソッドです。

- **デフォルト値：** `"POST"`

```typescript
method?: string
```

#### `headers`

リクエストヘッダーです。

```typescript
headers?: HeadersInit
```

#### `withCredentials`

クレデンシャル（Cookie など）を送信するかどうか。

- **デフォルト値：** `false`

```typescript
withCredentials?: boolean
```

#### `fieldName`

フォームフィールド名です。

- **デフォルト値：** `"file"`

```typescript
fieldName?: string
```

#### `maxSize`

最大ファイルサイズ（バイト単位）です。

- **デフォルト値：** `Infinity`

```typescript
maxSize?: number
```

#### `accept`

許可するファイルの MIME タイプの配列です。

```typescript
accept?: string[]
```

**例：**

```typescript
accept: ["image/png", "image/jpeg"];
```

#### `data`

追加のフォームデータです。オブジェクトまたはオブジェクトを返す関数を指定できます。

```typescript
data?: Record<string, any> | (() => Record<string, any>)
```

#### `format`

サーバー応答を整形し、標準の `UploadResult` を返す関数です。

```typescript
format?: (result: any) => UploadResult | Promise<UploadResult>
```

**例：**

```typescript
format: (response) => ({
  url: response.data.url,
  name: response.data.filename,
});
```

#### `upload`

カスタムアップロード関数です。この関数を設定すると、デフォルトのアップロードロジックが置き換えられます。

```typescript
upload?: (file: File, context: UploadContext) => Promise<UploadResult>
```

**引数：**

- `file` - ファイルオブジェクト
- `context` - アップロードコンテキスト。`signal`（中断シグナル）、`config`（設定）、`onProgress`（進捗コールバック）を含みます。

**例：**

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

アップロード前のフックです。`false` を返すとアップロードをキャンセルし、新しい `File` オブジェクトを返すと元のファイルを置き換えます。

```typescript
beforeUpload?: (file: File) => File | false | Promise<File | false>
```

#### `validate`

ファイル検証関数です。検証失敗時にはエラーメッセージ文字列を返します。

```typescript
validate?: (file: File) => string | void
```

**例：**

```typescript
validate: (file) => {
  if (file.size > 10 * 1024 * 1024) {
    return "ファイルサイズは 10MB を超えることはできません。";
  }
};
```

### 5.3 コールバックイベント

#### `onProgress`

アップロード進捗コールバックです。

```typescript
onProgress?: (progress: UploadProgress, file: File) => void
```

`UploadProgress` の構造：

```typescript
interface UploadProgress {
  loaded: number; // アップロード済みバイト数
  total: number; // 総バイト数
  percent: number; // パーセンテージ
}
```

#### `onSuccess`

アップロード成功時のコールバックです。

```typescript
onSuccess?: (result: UploadResult, file: File) => void
```

`UploadResult` の構造：

```typescript
interface UploadResult {
  url: string; // リソース URL
  name?: string; // ファイル名
}
```

#### `onUploadError`

アップロードエラー時のコールバックです。

```typescript
onUploadError?: (error: Error, file: File) => void
```

#### `onTypeError`

ファイルタイプエラー時のコールバックです。

```typescript
onTypeError?: (error: Error, file: File) => void
```

#### `onSizeError`

ファイルサイズエラー時のコールバックです。

```typescript
onSizeError?: (error: Error, file: File) => void
```

#### `onValidateError`

検証エラー時のコールバックです。

```typescript
onValidateError?: (error: Error, file: File) => void
```

### 5.4 完全な例

```typescript
import { Editor, i18n } from "@catmasks/free-editor";
import type { UploadResult, UploadContext } from "@catmasks/free-editor";

const editor = new Editor(document.getElementById("editor"), {
  uploader: {
    // 画像アップロード設定
    image: {
      maxSize: 5 * 1024 * 1024, // 5MB
      accept: ["image/png", "image/jpeg"],
      async upload(file: File, ctx: UploadContext) {
        return new Promise<UploadResult>((resolve, reject) => {
          // カスタムアップロードロジック...
          resolve({ url: "https://example.com/image.png" });
        });
      },
    },
    // 動画アップロード設定
    video: {
      maxSize: 500 * 1024 * 1024, // 500MB
      accept: ["video/*"],
      onUploadError(error) {
        alert(i18n.t("upload.uploadFailed"));
      },
    },
    // 添付ファイルアップロード設定
    attachment: {
      onSuccess(result, file) {
        console.log("アップロード成功:", result.url);
      },
    },
  },
});
```

---

## 6. 国際化 (i18n)

`i18n` は多言語を管理するグローバルシングルトンです。

```typescript
import { i18n } from "@catmasks/free-editor";
```

### 6.1 プロパティ

#### `locale`

現在の言語です。

```typescript
console.log(i18n.locale); // "zh-CN"
```

### 6.2 メソッド

#### `t(key, ...args)`

現在の言語における `key` の翻訳テキストを取得します。プレースホルダ `{0}`, `{1}`... による置換に対応しています。

```typescript
t(key: string, ...args: any[]): string
```

**例：**

```typescript
i18n.t("toolbar.bold"); // "太字"
i18n.t("upload.fileSizeExceeded"); // "ファイルサイズが制限を超えています"
```

**利用可能な翻訳キー：**

| 名前空間     | 説明                       |
| ------------ | -------------------------- |
| `common`     | 共通テキスト               |
| `toolbar`    | ツールバーテキスト         |
| `link`       | リンク関連テキスト         |
| `fontFamily` | フォント関連テキスト       |
| `fontSize`   | フォントサイズ関連テキスト |
| `alignment`  | 配置関連テキスト           |
| `heading`    | 見出し関連テキスト         |
| `upload`     | アップロード関連テキスト   |
| `media`      | メディアノードテキスト     |
| `attachment` | 添付ファイル関連テキスト   |

#### `setLocale(locale)`

現在の言語を設定します。

```typescript
setLocale(locale: Locale): void
```

**引数：**

| 引数     | 型       | 説明                                     |
| -------- | -------- | ---------------------------------------- |
| `locale` | `Locale` | 対象言語：`"zh-CN"` / `"en"` / `"ja-JP"` |

#### `extend(messages)`

現在の言語のメッセージオブジェクトを拡張します（深いマージを行います）。

> **注意：** このメソッドはエディタ初期化前に呼び出してください。初期化後に呼び出してもエディタには反映されません。

```typescript
extend(messages: DeepPartial<LocaleMessages>): void
```

**例：**

```typescript
import { i18n } from "@catmasks/free-editor";

// エディタ作成前に翻訳を拡張
i18n.extend({
  toolbar: {
    bold: "カスタム太字",
    italic: "カスタム斜体",
  },
});

// その後エディタを作成
const editor = new Editor(...);
```

#### `subscribe(callback)`

言語変更イベントを購読します。購読解除関数を返します。

> **注意：** 破棄時には返された購読解除関数を呼び出し、メモリリークを防止してください。

```typescript
subscribe(callback: (locale: Locale) => void): () => void
```

**例：**

```typescript
const unsubscribe = i18n.subscribe((locale) => {
  console.log("言語が切り替わりました:", locale);
});

// 不要になったら購読解除
unsubscribe();
```
