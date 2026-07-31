<h4 align="right"><a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <strong>日本語</strong></h4>
<br/>
<p align="center">
  <img src="./playground/src/assets/logo.png" alt="logo">
</p>
<h1 align="center">FreeEditor</h1>
<h4 align="center">TipTap コアをベースに開発された軽量リッチテキストエディタ</h4>
<h4 align="center">プラグイン不要ですぐに使え、すべてのフロントエンドフレームワークに対応。中国語・英語・日本語を標準搭載</h4>
<p align="center">
  <img src="./playground/src/assets/image.png" alt="image">
</p>

### 使い始める

お役に立てたなら、スターを付けてください。新バージョンがリリースされたときに通知を受け取れます。

```bash
npm install @catmasks/free-editor
```

または

```bash
pnpm add @catmasks/free-editor
```

### CDN での利用

バンドラーを使用しないプロジェクトでは、ESM CDN 経由でブラウザで直接使用できます。

> **注意**:
>
> - このパッケージは ESM 形式のみ提供しています。`<script type="module">` で読み込む必要があり、従来の `<script>` タグでのインポートはサポートされていません。
> - `@tiptap/core`、`@tiptap/pm`、`@tiptap/extension-gapcursor` は peerDependencies として外部化されているため、CDN で使用する際はこれらの依存関係が解決されることを確認してください。esm.sh などの自動依存関係解決に対応した CDN を使用すると、手動設定の手間を省けます。

**esm.sh を使用する（推奨）**

esm.sh は peerDependencies を自動的に解決して読み込むため、手動でインポートする必要はありません。

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

**importmap を使用する（オプション）**

裸のインポート形式を使用したい場合は、importmap を併用できます：

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

**jsdelivr / unpkg を使用する（代替）**

jsdelivr または unpkg を使用する場合は、peerDependencies も正しく読み込まれることを確認してください（自動解決に対応した esm.sh の使用を推奨します）。

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
</script>
```

> **ヒント**:
>
> - `@0.0.4` を実際に使用するバージョンに置き換えてください。
> - `style.css` スタイルシートは**個別にインポートする必要があります**。そうしないとエディタが正しく表示されません。

## ナビゲーション

- [1. クイックスタート](#1-クイックスタート)
- [2. 設定項目](#2-設定項目)
- [3. インスタンスプロパティとメソッド](#3-インスタンスプロパティとメソッド)
- [4. 内蔵プラグイン](#4-内蔵プラグイン)
- [5. メディアアップロード](#5-メディアアップロード)
- [6. 国際化（i18n）](#6-国際化i18n)

---

## 1. クイックスタート

### 基本的な使い方

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

## 2. 設定項目

コンストラクタの第2引数に `EditorOptions` 設定オブジェクトを渡します：

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

エディタの初期内容（HTML 文字列）。

```typescript
content?: string
```

### `locale`

エディタの初期ロケール。

- **デフォルト:** `"zh-CN"`
- **指定可能な値:** `"zh-CN"` | `"en"` | `"ja-JP"`

```typescript
locale?: Locale
```

### `theme`

エディタのテーマ。

- **デフォルト:** `"light"`
- **指定可能な値:** `"light"` | `"dark"`

```typescript
theme?: EditorTheme
```

### `placeholder`

エディタが空の場合に表示されるプレースホルダー文。

- **デフォルト:** `"内容を入力してください..."`

```typescript
placeholder?: string
```

### `include`

指定したプラグインのみを含めます。空の場合はすべてのプラグインを含みます。

- **デフォルト:** `[]`（すべてのプラグイン）

```typescript
include?: EditorPluginKey[]
```

**例:** 見出しと太字のみ有効にする

```typescript
include: ["heading", "fontBold"];
```

### `exclude`

指定したプラグインを除外します。

- **デフォルト:** `[]`（除外なし）

```typescript
exclude?: EditorPluginKey[]
```

**例:** コードブロックを除外する

```typescript
exclude: ["codeBlock"];
```

### `uploader`

メディアアップロード設定。画像・動画・添付ファイルの各タイプごとに個別に設定できます。詳細は [第5章](#5-メディアアップロード) をご参照ください。

```typescript
uploader?: MediaUploaderOptions
```

---

## 3. インスタンスプロパティとメソッド

### 3.1 インスタンスプロパティ

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

#### `locale`

現在のロケールを取得します。

```typescript
console.log(editor.locale); // "zh-CN"
```

### 3.2 インスタンスメソッド

#### `setTheme(theme)`

テーマを設定します。

```typescript
setTheme(theme: EditorTheme): void
```

**パラメータ:**

| パラメータ | 型            | 説明                                |
| ---------- | ------------- | ----------------------------------- |
| `theme`    | `EditorTheme` | テーマ名: `"light"` または `"dark"` |

#### `toggleTheme()`

テーマを切り替えます（ライト／ダーク）。

```typescript
toggleTheme(): void
```

#### `setLocale(locale)`

エディタのロケールを設定します。

```typescript
setLocale(locale: Locale): void
```

**パラメータ:**

| パラメータ | 型       | 説明                                       |
| ---------- | -------- | ------------------------------------------ |
| `locale`   | `Locale` | 対象ロケール: `"zh-CN"`、`"en"`、`"ja-JP"` |

#### `getHtml()`

エディタの HTML 内容を取得します。

```typescript
getHtml(): string
```

**戻り値:** `string` – HTML 文字列

**スロー:** エディタが破棄されている場合は `Error: Editor has been destroyed` をスローします。

#### `destroy()`

エディタを破棄し、すべてのリソースとイベントリスナーをクリーンアップします。

```typescript
destroy(): void
```

---

## 4. 内蔵プラグイン

以下はすべての利用可能なプラグインキー（`EditorPluginKey`）です：

| プラグインキー  | 名前           | 説明                                           |
| --------------- | -------------- | ---------------------------------------------- |
| `heading`       | 見出し         | H1～H6 見出しに対応                            |
| `fontBold`      | 太字           | 太字の切り替え                                 |
| `fontItalic`    | 斜体           | 斜体の切り替え                                 |
| `fontColor`     | 文字色         | 文字色を設定                                   |
| `fontHighlight` | ハイライト     | 背景ハイライトを設定                           |
| `fontFamily`    | フォント       | フォントファミリを設定                         |
| `fontSize`      | フォントサイズ | 文字サイズを設定                               |
| `alignment`     | 配置           | 文字の左揃え／中央揃え／右揃え                 |
| `link`          | リンク         | リンクの挿入・編集・削除                       |
| `codeBlock`     | コードブロック | コードブロックを挿入                           |
| `image`         | 画像           | 画像を挿入（ドラッグ＆ドロップ／貼り付け）     |
| `video`         | 動画           | 動画を挿入（ドラッグ＆ドロップ／貼り付け）     |
| `attachment`    | 添付ファイル   | ファイルを添付（ドラッグ＆ドロップ／貼り付け） |
| `underline`     | 下線           | 文字に下線を追加                               |
| `strike`        | 取り消し線     | 文字に取り消し線を追加                         |
| `superscript`   | 上標           | 文字に上標を追加                               |
| `subscript`     | 下標           | 文字に下標を追加                               |
| `orderedList`   | 有序リスト     | 有序リストを挿入                               |
| `bulletList`    | 无序リスト     | 无序リストを挿入                               |
| `indent`        | インデント     | 文字をインデントする                           |
| `outdent`       | オーデンデント | 文字をインデントを減少する                     |
| `lineBreak`     | ド行区切り     | 文字をソフトラインブレーを挿入する             |

> **ヒント:** `include` または `exclude` 設定を使用して、有効にするプラグインを柔軟に制御できます。

---

## 5. メディアアップロード

### 5.1 設定構造

アップロード設定はメディアタイプごとに3つのカテゴリに分かれています：

```typescript
interface MediaUploaderOptions {
  image?: MediaUploaderConfig; // 画像アップロード設定
  video?: MediaUploaderConfig; // 動画アップロード設定
  attachment?: MediaUploaderConfig; // 添付ファイルアップロード設定
}
```

### 5.2 アップロード設定項目 (`MediaUploaderConfig`)

以下は単一メディアタイプのすべての設定項目です：

#### `action`

アップロード先の URL。

```typescript
action?: string
```

#### `method`

HTTP メソッド。

- **デフォルト:** `"POST"`

```typescript
method?: string
```

#### `headers`

リクエストヘッダー。

```typescript
headers?: HeadersInit
```

#### `withCredentials`

クレデンシャル（Cookie など）を送信するかどうか。

- **デフォルト:** `false`

```typescript
withCredentials?: boolean
```

#### `fieldName`

フォームのフィールド名。

- **デフォルト:** `"file"`

```typescript
fieldName?: string
```

#### `maxSize`

最大ファイルサイズ（バイト単位）。

- **デフォルト:** `Infinity`

```typescript
maxSize?: number
```

#### `accept`

受け付けるファイルの MIME タイプの配列。

```typescript
accept?: string[]
```

**例:**

```typescript
accept: ["image/png", "image/jpeg"];
```

#### `data`

追加のフォームデータ。オブジェクトまたはオブジェクトを返す関数を指定できます。

```typescript
data?: Record<string, any> | (() => Record<string, any>)
```

#### `format`

サーバーレスポンスを整形し、標準の `UploadResult` を返します。

```typescript
format?: (result: any) => UploadResult | Promise<UploadResult>
```

**例:**

```typescript
format: (response) => ({
  url: response.data.url,
  name: response.data.filename,
});
```

#### `upload`

カスタムアップロード関数。設定するとデフォルトのアップロードロジックが置き換えられます。

```typescript
upload?: (file: File, context: UploadContext) => Promise<UploadResult>
```

**パラメータ:**

- `file` – ファイルオブジェクト
- `context` – `signal`（中止シグナル）、`config`（設定）、`onProgress`（進捗コールバック）を含むアップロードコンテキスト

**例:**

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

アップロード前のフック。`false` を返すとアップロードをキャンセルし、新しい `File` オブジェクトを返すとファイルを置き換えます。

```typescript
beforeUpload?: (file: File) => File | false | Promise<File | false>
```

#### `validate`

ファイルを検証します。エラーメッセージ文字列を返すと検証失敗とみなします。

```typescript
validate?: (file: File) => string | void
```

**例:**

```typescript
validate: (file) => {
  if (file.size > 10 * 1024 * 1024) {
    return "ファイルサイズは 10MB を超えられません";
  }
};
```

### 5.3 コールバックイベント

#### `onProgress`

アップロード進捗コールバック。

```typescript
onProgress?: (progress: UploadProgress, file: File) => void
```

`UploadProgress` 構造：

```typescript
interface UploadProgress {
  loaded: number; // 読み込み済みバイト数
  total: number; // 合計バイト数
  percent: number; // パーセンテージ
}
```

#### `onSuccess`

アップロード成功コールバック。

```typescript
onSuccess?: (result: UploadResult, file: File) => void
```

`UploadResult` 構造：

```typescript
interface UploadResult {
  url: string; // リソース URL
  name?: string; // ファイル名
}
```

#### `onUploadError`

アップロードエラーコールバック。

```typescript
onUploadError?: (error: Error, file: File) => void
```

#### `onTypeError`

ファイルタイプエラーコールバック。

```typescript
onTypeError?: (error: Error, file: File) => void
```

#### `onSizeError`

ファイルサイズエラーコールバック。

```typescript
onSizeError?: (error: Error, file: File) => void
```

#### `onValidateError`

検証エラーコールバック。

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

## 6. 国際化（i18n）

`i18n` は多言語対応を管理するグローバルシングルトンです。

```typescript
import { i18n } from "@catmasks/free-editor";
```

### 6.1 プロパティ

#### `locale`

現在のロケール。

```typescript
console.log(i18n.locale); // "zh-CN"
```

### 6.2 メソッド

#### `t(key, ...args)`

現在のロケールにおける `key` に対応する翻訳テキストを返します。プレースホルダ `{0}`, `{1}`... の置換に対応しています。

```typescript
t(key: string, ...args: any[]): string
```

**例:**

```typescript
i18n.t("toolbar.bold"); // "太字"
i18n.t("upload.fileSizeExceeded"); // "ファイルサイズが制限を超えています"
```

**利用可能な翻訳キー:**

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

現在のロケールを設定します。

```typescript
setLocale(locale: Locale): void
```

**パラメータ:**

| パラメータ | 型       | 説明                                       |
| ---------- | -------- | ------------------------------------------ |
| `locale`   | `Locale` | 対象ロケール: `"zh-CN"`、`"en"`、`"ja-JP"` |

#### `extend(messages)`

現在のロケールのメッセージオブジェクトを拡張します（ディープマージ）。

> **注意:** このメソッドはエディタの初期化**前**に呼び出す必要があります。初期化後に呼び出してもエディタには反映されません。

```typescript
extend(messages: DeepPartial<LocaleMessages>): void
```

**例:**

```typescript
import { i18n } from "@catmasks/free-editor";

// エディタを作成する前に翻訳を拡張
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

ロケール変更イベントを購読します。購読解除関数を返します。

> **注意:** 破棄時に返された購読解除関数を呼び出して、メモリリークを防止してください。

```typescript
subscribe(callback: (locale: Locale) => void): () => void
```

**例:**

```typescript
const unsubscribe = i18n.subscribe((locale) => {
  console.log("ロケールが変更されました:", locale);
});

// 不要になったら購読解除
unsubscribe();
```
