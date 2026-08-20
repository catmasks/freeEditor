<h4 align="right"><a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <strong>日本語</strong> </h4>
<br/>
<p align="center">
  <img src="./csrTest/src/assets/logo.png" alt="logo">
</p>
<h1 align="center">FreeEditor</h1>
<h4 align="center">TipTap コアをベースに構築された軽量リッチテキストエディタ</h4>
<h4 align="center">すぐに使え、すべてのフロントエンドフレームワークをサポートし、中国語・英語・日本語を内蔵し、SSR と互換性がある</h4>
<p align="center">
  <img src="./csrTest/src/assets/freeEditor.png" alt="freeEditor">
</p>

---

## 🧭 目次

- [1. クイックスタート](#quick-start)
- [2. 設定オプション](#configuration)
- [3. インスタンスのプロパティとメソッド](#instance-properties-methods)
- [4. 組み込みプラグイン](#built-in-plugins)
- [5. メディアアップロード](#media-upload)
- [6. 国際化 (i18n)](#i18n)
- [7. SSR サポート](#ssr-support)

---

## 🚀 <a id="quick-start"></a>1. クイックスタート

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

### 💡 ヒント

> このプロジェクトがお役に立てば、⭐ を付けてくださると幸いです。新しいバージョンがリリースされた際に、通知を受け取ることができます。

---

## 📦 インストール

```bash
npm install @catmasks/free-editor
```

または

```bash
pnpm add @catmasks/free-editor
```

### CDN による導入

プロジェクトで Vite や Webpack などのビルドツールを使用しない場合、ESM CDN を介して Free Editor を利用することができます。

> **⚠️ 注意事項**
>
> - ブラウザ上の CDN シナリオでは、必ず ESM をご利用ください。
> - **esm.sh** の使用を推奨します。Free Editor の npm 依存関係を自動的に解決するため、手動での依存関係設定が不要になります。
> - Free Editor の一部の機能は動的 `import()` を使用して読み込まれるため、ビルド後に `chunks/` ディレクトリが生成されます。このディレクトリは `index.js` とともにデプロイする必要があります。
> - `style.css` は個別にインポートする必要があります。

#### esm.sh を使用する（推奨）

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
        placeholder: "コンテンツを入力してください...",
      });
    </script>
  </body>
</html>
```

> esm.sh を使用する場合、`@catmasks/free-editor` のみをインポートすればよく、npm 依存関係は自動的に解決されます。

#### jsDelivr / unpkg を使用する

Free Editor の `dist/index.js` を直接読み込む場合、一部の依存関係が external 化されているため、ブラウザは npm のベアモジュールをそのまま解決できません。例えば：

```js
import { Editor } from "@tiptap/core";
```

この場合は、`importmap` を使用して external 依存関係をマッピングする必要があります：

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
      "markdown-it": "https://esm.sh/markdown-it@14.3.0",
      "prosemirror-markdown": "https://esm.sh/prosemirror-markdown@1.13.5"
    }
  }
</script>
```

> **ご案内**
>
> - 推奨されるのは、esm.sh を優先してご利用いただくことです。
> - jsDelivr または unpkg をご利用の場合は、お使いのバージョンに応じた external 依存関係に基づいて `importmap` を設定してください。
> - ビルド後の `chunks/` ディレクトリは、`index.js` とともにデプロイする必要があります。
> - `style.css` は必ず個別にインポートしてください。
> - 本番プロジェクトでは、npm/pnpm と Vite などのビルドツールを併用することを推奨します。

---

## ⚙️ <a id="configuration"></a>2. 設定オプション

コンストラクタは第 2 引数として `EditorOptions` 設定オブジェクトを受け取ります。

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
  onFocus?: () => void;
  onBlur?: () => void;
  onSelectionChange?: () => void;
  onDestroy?: () => void;
}
```

### `content`

エディタの初期コンテンツ。HTML 文字列で指定します。

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

### `height`

エディタの初期の高さ（ピクセル単位）。

- **デフォルト:** `undefined`

```typescript
height?: number
```

### `maxHeight`

エディタの最大の高さ（ピクセル単位）。

- **デフォルト:** `undefined`

```typescript
maxHeight?: number
```

### `theme`

エディタのテーマ。

- **デフォルト:** `"light"`
- **指定可能な値:** `"light"` | `"dark"`

```typescript
theme?: EditorTheme
```

### `disabled`

エディタを無効にするかどうか。

- **デフォルト:** `false`

```typescript
disabled?: boolean
```

### `readonly`

エディタを読み取り専用にするかどうか。

- **デフォルト:** `false`

```typescript
readonly?: boolean
```

### `placeholder`

エディタが空の場合に表示されるプレースホルダーテキスト。

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

**例:** 見出しと太字のみを有効にする

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

メディアアップロードの設定。画像、動画、添付ファイルのそれぞれに対して個別に設定できます。詳細は [第 5 章](#media-upload) を参照してください。

```typescript
uploader?: MediaUploaderOptions
```

### `onChange`

コンテンツ変更コールバック。ドキュメントのコンテンツが変更されたときに呼び出されます（入力、コマンドの実行、メディアアップロードなど）。コールバックは変更後の HTML 文字列を受け取ります。

```typescript
onChange?: (html: string) => void
```

**例:**

```typescript
const editor = new Editor(el, {
  onChange: (html) => {
    console.log("コンテンツが変更されました:", html);
  },
});
```

### `onCreated`

作成完了コールバック（引数なし）。エディタがマウントされ、初期化が完了したときに呼び出されます。

```typescript
onCreated?: () => void
```

**例:**

```typescript
const editor = new Editor(el, {
  onCreated: () => {
    console.log("エディタがマウントされ、初期化が完了しました");
  },
});
```

### `onFocus`、`onBlur`、`onSelectionChange`、`onDestroy`

エディタのイベントコールバックです（いずれも引数なし）。フォーカス変化、選択範囲の変化、破棄時のフックに使用します。

```typescript
onFocus?: () => void
onBlur?: () => void
onSelectionChange?: () => void
onDestroy?: () => void
```

- `onFocus` —— エディタがフォーカスを得たときに呼び出されます。
- `onBlur` —— エディタがフォーカスを失ったときに呼び出されます。
- `onSelectionChange` —— 選択範囲（カーソル）が移動したときに呼び出されます。
- `onDestroy` —— エディタが破棄され、リソースの後片付けが完了した後に呼び出されます。外部リスナーの購読解除など、副作用の後片付けに適しています。このとき `getHtml()` / `getJson()` などはもはや利用できないことに注意してください。

**例:**

```typescript
const editor = new Editor(el, {
  onFocus: () => console.log("フォーカス獲得"),
  onBlur: () => console.log("フォーカス喪失"),
  onSelectionChange: () => console.log("選択範囲変更"),
  onDestroy: () => console.log("破棄されました"),
});
```

### 複数インスタンス

> **⚠️ 注意:** `theme`（テーマ）と `locale`（言語）は、ページ上のすべてのエディタインスタンス間で**グローバルに共有**されます（インスタンスごとに分離されていません）。

- **テーマ**はドキュメントルート（`data-theme`）に格納されます。任意のインスタンスで `editor.setTheme()` を呼び出すと、ページ上のすべてのエディタに影響します。複数インスタンスを共存させる場合は、同じテーマを維持してください。
- **言語**はグローバルな `i18n` シングルトンです。**最初に作成されたエディタ**が自身の `locale` オプションでグローバル言語を引き継ぎます。その後作成されたインスタンスはそれを静かに上書きしないため、後から作成したエディタが先に作成したエディタの言語を意図せず変更することを防ぎます。
- グローバル言語をいつでも切り替えるには、任意のインスタンスで `editor.setLocale(locale)` を呼び出すか、`i18n.setLocale(locale)` を明示的に呼び出してください。
- したがって、複数エディタを埋め込む場合は**同じテーマと言語**を使用する（または `setTheme` / `setLocale` / `i18n.setLocale` などの API で統一的に制御する）ことをおすすめします。

---

## 🧩 <a id="instance-properties-methods"></a>3. インスタンスのプロパティとメソッド

### 3.1 インスタンスプロパティ

#### `isMounted`

エディタがマウントされているかどうかを返します。

```typescript
console.log(editor.isMounted); // true
```

#### `isDestroyed`

エディタが破棄されているかどうかを返します。

```typescript
console.log(editor.isDestroyed); // false
```

#### `theme`

現在のテーマを返します。`"light"` または `"dark"` です。

```typescript
console.log(editor.theme); // "light"
```

#### `isDark`

ダークモードが有効かどうかを返します。

```typescript
console.log(editor.isDark); // false
```

#### `disabled`

エディタが無効かどうかを返します。

```typescript
console.log(editor.disabled); // false
```

#### `readonly`

エディタが読み取り専用かどうかを返します。

```typescript
console.log(editor.readonly); // false
```

#### `locale`

現在のロケールを返します。

```typescript
console.log(editor.locale); // "zh-CN"
```

### 3.2 インスタンスメソッド

#### `setTheme(theme)`

テーマを設定します。

```typescript
setTheme(theme: EditorTheme): void
```

| 引数    | 型            | 説明                                |
| ------- | ------------- | ----------------------------------- |
| `theme` | `EditorTheme` | テーマ名、`"light"` または `"dark"` |

#### `toggleTheme()`

ライトテーマとダークテーマを切り替えます。

```typescript
toggleTheme(): void
```

#### `setLocale(locale)`

エディタのロケールを設定します。

```typescript
setLocale(locale: Locale): void
```

| 引数     | 型       | 説明                                                        |
| -------- | -------- | ----------------------------------------------------------- |
| `locale` | `Locale` | ターゲットロケール、`"zh-CN"`、`"en"`、`"ja-JP"` のいずれか |

#### `getHtml()`

エディタのコンテンツを HTML として返します。

```typescript
getHtml(): string
```

#### `getJson()`

エディタのコンテンツを ProseMirror JSON ドキュメントオブジェクト（`JSONContent`）として返します。構造化された保存や後続の再レンダリングに適しています。

```typescript
getJson(): JSONContent
```

**戻り値:** `JSONContent` – ProseMirror JSON ドキュメントオブジェクト。  
**スロー:** エディタが破棄されている場合、`Error: Editor has been destroyed` をスローします。

#### `setHtml(html)`

エディタの HTML コンテンツを設定します。呼び出すとエディタのコンテンツが即座に置き換えられます。空文字列を渡すとコンテンツがクリアされます。

```typescript
setHtml(html: string): void
```

| 引数   | 型       | 説明                  |
| ------ | -------- | --------------------- |
| `html` | `string` | HTML 文字列、空でも可 |

**例:**

```typescript
// コンテンツを置き換える
editor.setHtml("<p>新しいコンテンツ</p>");

// コンテンツをクリアする
editor.setHtml("");
```

**スロー:** エディタが破棄されている場合、`Error: Editor has been destroyed` をスローします。

> **⚠️ 注意:** `setHtml()` はコンテンツ変更トランザクションでコンテンツを置き換えるため、**`onChange` コールバックが発火します**。

#### `focus()`

エディタにフォーカスを当て、カーソルをコンテンツ領域に配置します。

```typescript
focus(): void
```

#### `blur()`

エディタのフォーカスを外します。

```typescript
blur(): void
```

#### `getSelectedText()`

現在選択（ハイライト）されているプレーンテキストを返します。選択がない場合は空文字列を返します。

```typescript
getSelectedText(): string
```

```typescript
const selected = editor.getSelectedText();
// 例: "こんにちは"
```

#### `getText()`

HTML タグを取り除いたプレーンテキストのコンテンツを返します。下記のカウント系メソッドと組み合わせて利用できます。

```typescript
getText(): string
```

#### `getCharacterCount()`

プレーンテキストの文字数を返します（空白と改行を含む）。

```typescript
getCharacterCount(): number
```

```typescript
const count = editor.getCharacterCount();
```

#### `pauseAllVideos()`

エディタ内のすべての動画を一時停止します。一時停止結果と動画の総数を返します。

```typescript
pauseAllVideos(): { state: boolean; total: number }
```

| フィールド | 型        | 説明                                     |
| ---------- | --------- | ---------------------------------------- |
| `state`    | `boolean` | すべての動画が正常に一時停止したかどうか |
| `total`    | `number`  | エディタ内の動画の総数                   |

**例:**

```typescript
const result = editor.pauseAllVideos();
// { state: true, total: 2 } —— 2 つの動画を正常に一時停止しました
```

**補足:** エディタを破棄（`destroy()`）すると自動的にすべての動画が一時停止されるため、このメソッドを呼ぶ必要はありません。

**スロー:** エディタが破棄されている場合、`Error: Editor has been destroyed` をスローします。

#### `setDisabled(disabled)`

エディタの無効状態を設定します。

```typescript
setDisabled(disabled: boolean): void
```

#### `setReadonly(readonly)`

エディタの読み取り専用状態を設定します。

```typescript
setReadonly(readonly: boolean): void
```

#### `destroy()`

エディタを破棄し、すべてのリソースとイベントリスナーをクリーンアップします。

```typescript
destroy(): void
```

---

## 📋 <a id="built-in-plugins"></a>4. 組み込みプラグイン

利用可能なプラグインキー（`EditorPluginKey`）は以下の通りです。

| プラグインキー  | 名称                    | 説明                                                             |
| --------------- | ----------------------- | ---------------------------------------------------------------- |
| `heading`       | 見出し                  | H1～H6 の見出しをサポート                                        |
| `fontBold`      | 太字                    | 太字の切り替え                                                   |
| `fontItalic`    | 斜体                    | 斜体の切り替え                                                   |
| `fontColor`     | 文字色                  | 文字色を設定                                                     |
| `fontHighlight` | ハイライト              | 背景ハイライトを設定                                             |
| `fontFamily`    | フォント                | フォントファミリを設定                                           |
| `fontSize`      | フォントサイズ          | フォントサイズを設定                                             |
| `alignment`     | 配置                    | 左揃え、中央揃え、右揃え                                         |
| `link`          | リンク                  | リンクの挿入、編集、削除                                         |
| `codeBlock`     | コードブロック          | コードブロックを挿入                                             |
| `image`         | 画像                    | ドラッグ＆ドロップおよび貼り付けによる画像挿入をサポート         |
| `video`         | 動画                    | ドラッグ＆ドロップおよび貼り付けによる動画挿入をサポート         |
| `attachment`    | 添付ファイル            | ドラッグ＆ドロップおよび貼り付けによる添付ファイル挿入をサポート |
| `underline`     | 下線                    | 下線の切り替え                                                   |
| `strike`        | 取り消し線              | 取り消し線の切り替え                                             |
| `superscript`   | 上付き文字              | 上付き文字の切り替え                                             |
| `subscript`     | 下付き文字              | 下付き文字の切り替え                                             |
| `orderedList`   | 番号付きリスト          | 番号付きリストを挿入                                             |
| `bulletList`    | 箇条書きリスト          | 箇条書きリストを挿入                                             |
| `taskList`      | タスクリスト            | チェックボックス付きタスクリストを挿入                           |
| `indent`        | インデント増            | インデントを増やす                                               |
| `outdent`       | インデント減            | インデントを減らす                                               |
| `lineBreak`     | 改行                    | 改行を挿入                                                       |
| `lineHeight`    | 行間                    | 段落の行間を設定                                                 |
| `blockquote`    | 引用                    | 引用ブロックを挿入                                               |
| `divider`       | 区切り線                | 水平区切り線を挿入                                               |
| `inlineCode`    | インラインコード        | インラインコード（`code` など）を挿入                            |
| `formatPainter` | 書式ペインタ            | 書式のコピー/貼り付け                                            |
| `undo`          | 元に戻す                | 直前の操作を元に戻す                                             |
| `redo`          | やり直し                | 元に戻した操作をやり直す                                         |
| `table`         | テーブル                | テーブルの挿入または編集                                         |
| `clearFormat`   | 書式クリア              | 選択したテキストのすべての書式をクリアする                       |
| `markdown`      | Markdown                | Markdown フォーマットをサポート                                  |
| `exportWord`    | Word としてエクスポート | 内容を Word 文書としてエクスポートする                           |
| `importWord`    | Word 文書をインポート   | Word 文書をエディタにインポートする                              |
| `exportPdf`     | PDF としてエクスポート  | 内容を PDF 文書としてエクスポートする                            |

> **💡 ヒント:** `include` または `exclude` オプションを使用して、有効にするプラグインを柔軟に制御できます。

---

## 📎 <a id="media-upload"></a>5. メディアアップロード

### 5.1 設定構造

アップロード設定は、次の 3 つのメディアタイプに分かれています。

```typescript
interface MediaUploaderOptions {
  image?: MediaUploaderConfig; // 画像アップロード設定
  video?: MediaUploaderConfig; // 動画アップロード設定
  attachment?: MediaUploaderConfig; // 添付ファイルアップロード設定
}
```

### 5.2 アップロード設定 (`MediaUploaderConfig`)

各メディアタイプで使用できるオプションは以下の通りです。

#### `action`

アップロード先の URL。

```typescript
action?: string
```

#### `method`

HTTP リクエストメソッド。

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

リクエストにクレデンシャル（Cookie など）を含めるかどうか。

- **デフォルト:** `false`

```typescript
withCredentials?: boolean
```

#### `fieldName`

ファイルのフォームフィールド名。

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

許可する MIME タイプの配列。

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

サーバーのレスポンスを整形し、標準の `UploadResult` を返す関数。

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

カスタムアップロード関数。この関数を指定すると、デフォルトのアップロードロジックが置き換えられます。

```typescript
upload?: (file: File, context: UploadContext) => Promise<UploadResult>
```

**引数:**

- `file` – アップロードするファイル。
- `context` – アップロードコンテキスト。`signal`（中止シグナル）、`config`（設定）、`onProgress`（進捗コールバック）を含みます。

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

アップロード前に呼び出されるフック。`false` を返すとアップロードをキャンセルし、新しい `File` オブジェクトを返すと元のファイルを置き換えます。

```typescript
beforeUpload?: (file: File) => File | false | Promise<File | false>
```

#### `validate`

ファイルのバリデーション。エラーメッセージ文字列を返すとバリデーション失敗とみなされます。

```typescript
validate?: (file: File) => string | void
```

**例:**

```typescript
validate: (file) => {
  if (file.size > 10 * 1024 * 1024) {
    return "ファイルサイズは 10 MB を超えてはなりません";
  }
};
```

### 5.3 コールバックイベント

#### `onProgress`

アップロードの進捗コールバック。

```typescript
onProgress?: (progress: UploadProgress, file: File) => void
```

`UploadProgress` の構造:

```typescript
interface UploadProgress {
  loaded: number; // これまでにアップロードされたバイト数
  total: number; // 合計バイト数
  percent: number; // パーセンテージ
}
```

#### `onSuccess`

アップロード成功時のコールバック。

```typescript
onSuccess?: (result: UploadResult, file: File) => void
```

`UploadResult` の構造:

```typescript
interface UploadResult {
  url: string; // リソースの URL
  name?: string; // ファイル名
}
```

#### `onUploadError`

アップロードエラー時のコールバック。

```typescript
onUploadError?: (error: Error, file: File) => void
```

#### `onTypeError`

ファイルタイプエラー時のコールバック。

```typescript
onTypeError?: (error: Error, file: File) => void
```

#### `onSizeError`

ファイルサイズエラー時のコールバック。

```typescript
onSizeError?: (error: Error, file: File) => void
```

#### `onValidateError`

バリデーションエラー時のコールバック。

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
      maxSize: 5 * 1024 * 1024, // 5 MB
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
      maxSize: 500 * 1024 * 1024, // 500 MB
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

## 🌐 <a id="i18n"></a>6. 国際化 (i18n)

`i18n` は FreeEditor が提供するグローバルな国際化シングルトンです。エディタの言語、翻訳メッセージ、カスタム言語拡張を管理します。

```typescript
import { i18n } from "@catmasks/free-editor";
```

FreeEditor には以下の組み込み言語が含まれています。

- `zh-CN`: 簡体字中国語
- `en`: 英語
- `ja-JP`: 日本語

カスタム言語は `addMessages()` を介して登録できます。

---

### 6.1 プロパティ

#### `locale`

現在アクティブな言語を返します。

```typescript
console.log(i18n.locale);
// "zh-CN"
```

型:

```typescript
Locale;
```

---

### 6.2 メソッド

#### `t(key, ...args)`

現在の言語で指定された `key` の翻訳を取得します。

ドット記法によるネストされたキーと、`{0}`、`{1}` などのプレースホルダー置換をサポートします。

```typescript
t(key: string, ...args: unknown[]): string
```

**例:**

```typescript
i18n.t("toolbar.bold");
// "太字"

i18n.t("upload.fileSizeExceeded");
// "ファイルサイズが制限を超えています"
```

プレースホルダーを使用:

```typescript
i18n.t("common.count", 10);
// 例："合計 10 項目"
```

キーが存在しない場合は、キー自体が返されます。

```typescript
i18n.t("unknown.key");
// "unknown.key"
```

**主要な翻訳名前空間:**

| 名前空間     | 説明                       |
| ------------ | -------------------------- |
| `common`     | 共通テキスト               |
| `toolbar`    | ツールバーラベル           |
| `link`       | リンク関連テキスト         |
| `fontFamily` | フォント関連テキスト       |
| `fontSize`   | フォントサイズ関連テキスト |
| `alignment`  | 配置関連テキスト           |
| `lineHeight` | 行間関連テキスト           |
| `heading`    | 見出し関連テキスト         |
| `upload`     | アップロード関連テキスト   |
| `media`      | メディアノードラベル       |
| `attachment` | 添付ファイルラベル         |
| `table`      | テーブル関連テキスト       |

---

#### `setLocale(locale)`

現在の言語を切り替えます。

```typescript
setLocale(locale: Locale): void
```

**引数:**

| 引数     | 型       | 説明                   |
| -------- | -------- | ---------------------- |
| `locale` | `Locale` | 登録されたロケールキー |

組み込みロケール:

```typescript
i18n.setLocale("zh-CN");
i18n.setLocale("en");
i18n.setLocale("ja-JP");
```

指定されたロケールが登録されていない場合、`setLocale()` はエラーをスローします。

```typescript
i18n.setLocale("ko-KR");
// "ko-KR" が addMessages() で登録されていない場合はエラーがスローされる
```

切り替え後、`subscribe()` で登録されたすべての購読者に通知されます。

---

#### `getLocales()`

登録されているすべてのロケールの配列を返します。

```typescript
getLocales(): Locale[]
```

**例:**

```typescript
const locales = i18n.getLocales();

console.log(locales);
// ["zh-CN", "en", "ja-JP"]
```

カスタム言語を登録した後:

```typescript
i18n.addMessages("ko-KR", koKR);

console.log(i18n.getLocales());
// ["zh-CN", "en", "ja-JP", "ko-KR"]
```

返される配列は新しいコピーであり、内部レジストリを直接変更することはありません。

---

#### `hasLocale(locale)`

指定されたロケールが登録されているかどうかを確認します。

```typescript
hasLocale(locale: Locale): boolean
```

**例:**

```typescript
i18n.hasLocale("zh-CN");
// true

i18n.hasLocale("ko-KR");
// false
```

カスタム言語を登録した後:

```typescript
i18n.addMessages("ko-KR", koKR);

i18n.hasLocale("ko-KR");
// true
```

このメソッドは、`setLocale()` または `addMessages()` を呼び出す前にチェックするのに便利です。

---

#### `getMessages(locale)`

指定されたロケールのメッセージオブジェクトを返します。

```typescript
getMessages(locale: Locale): LocaleMessages | undefined
```

**例:**

```typescript
const messages = i18n.getMessages("zh-CN");

console.log(messages?.toolbar.bold);
// "太字"（中国語）
```

ロケールが存在しない場合は `undefined` を返します。

```typescript
const messages = i18n.getMessages("ko-KR");

console.log(messages);
// undefined
```

> **注意:**
> `getMessages()` は、該言語の完全なメッセージ（`extend()` で永続化された拡張を含む）を返します。

---

#### `addMessages(locale, messages)`

新しい言語を登録します。

```typescript
addMessages(
  locale: Locale,
  messages: LocaleMessages,
): void
```

このメソッドは**まだ存在しない言語のみを登録**でき、既存の言語を上書きすることはできません。

そのため、組み込み言語は上書きできません。

```typescript
i18n.addMessages("zh-CN", messages);
// ❌ 不可

i18n.addMessages("en", messages);
// ❌ 不可

i18n.addMessages("ja-JP", messages);
// ❌ 不可
```

カスタム言語は正常に登録できます。

```typescript
import koKR from "./locales/ko-KR";

i18n.addMessages("ko-KR", koKR);
```

登録後、その言語に切り替えられます。

```typescript
i18n.setLocale("ko-KR");

console.log(i18n.locale);
// "ko-KR"
```

他の言語も登録できます。

```typescript
i18n.addMessages("fr-FR", frFR);
i18n.addMessages("de-DE", deDE);
```

> **注意:**
> `addMessages()` は、以前に登録されたカスタム言語を含め、既存のロケールを上書きしません。既存のロケールを再登録しようとすると、エラーがスローされます。

---

#### `extend(messages)`

現在のロケールのメッセージオブジェクトを拡張します。

```typescript
extend(
  messages: DeepPartial<LocaleMessages>,
): void
```

このメソッドは**ディープマージ**を実行するため、追加または上書きするフィールドのみを指定すればよいです。

**例:**

```typescript
import { i18n } from "@catmasks/free-editor";

i18n.extend({
  toolbar: {
    bold: "カスタム太字",
    italic: "カスタム斜体",
  },
});
```

元のロケールメッセージの他のフィールドは変更されません。

たとえば:

```typescript
i18n.extend({
  toolbar: {
    bold: "太字",
  },
});
```

`toolbar.bold` のみが変更され、`toolbar.italic`、`toolbar.underline`、`toolbar.strike` は影響を受けません。

> **注意:**
> `extend()` による拡張は言語のメッセージに永続化され、`setLocale()` で切り替えて戻しても変更が保持されます。

---

#### `subscribe(callback)`

言語変更イベントを購読します。

```typescript
subscribe(
  callback: (locale: Locale) => void,
): () => void
```

`setLocale()` が呼び出されるたびに、すべての購読者が新しいロケールで呼び出されます。

**例:**

```typescript
const unsubscribe = i18n.subscribe((locale) => {
  console.log("言語が切り替わりました:", locale);
});

i18n.setLocale("en");
// "言語が切り替わりました: en"
```

`subscribe()` は購読解除関数を返します。

```typescript
unsubscribe();
```

購読解除後、コールバックは通知を受け取らなくなります。

> **注意:**
> コンポーネントやモジュールが言語変更をリッスンする必要がなくなった場合は、不要なコールバックや潜在的なメモリリークを避けるために、購読解除関数を呼び出してください。

---

### 6.3 カスタム言語

FreeEditor は `addMessages()` を介してカスタム言語の登録をサポートしています。

例えば、韓国語を追加する場合:

```typescript
import { i18n } from "@catmasks/free-editor";
import koKR from "./locales/ko-KR";

i18n.addMessages("ko-KR", koKR);

i18n.setLocale("ko-KR");

console.log(i18n.locale);
// "ko-KR"
```

登録後、通常通り使用できます。

```typescript
i18n.t("toolbar.bold");
```

また、以下で登録済みのすべてのロケールを取得できます。

```typescript
i18n.getLocales();
// ["zh-CN", "en", "ja-JP", "ko-KR"]
```

---

### 6.4 API サマリー

| API             | 型                            | 説明                                           |
| --------------- | ----------------------------- | ---------------------------------------------- |
| `locale`        | `Locale`                      | 現在のロケール                                 |
| `t()`           | `string`                      | キーの翻訳を取得                               |
| `setLocale()`   | `void`                        | 現在のロケールを切り替え                       |
| `getLocales()`  | `Locale[]`                    | 登録されているすべてのロケールを取得           |
| `hasLocale()`   | `boolean`                     | ロケールが登録されているか確認                 |
| `getMessages()` | `LocaleMessages \| undefined` | 指定言語の完全なメッセージを取得（拡張込み）   |
| `addMessages()` | `void`                        | 新しいロケールを登録（既存のものは上書き不可） |
| `extend()`      | `void`                        | 現在のロケールメッセージを拡張                 |
| `subscribe()`   | `() => void`                  | 言語変更を購読                                 |

### 6.5 組み込みロケールとカスタムロケール

FreeEditor は次のように定義します。

```typescript
type BuiltinLocale = "zh-CN" | "en" | "ja-JP";
```

`Locale` はこれを拡張してカスタムロケールを許可します。

```typescript
type Locale = BuiltinLocale | (string & {});
```

したがって、組み込みロケールを使用できます。

```typescript
i18n.setLocale("zh-CN");
i18n.setLocale("en");
i18n.setLocale("ja-JP");
```

また、カスタムロケールを登録して使用することもできます。

```typescript
i18n.addMessages("ko-KR", koKR);
i18n.setLocale("ko-KR");
```

---

## 🖥️ <a id="ssr-support"></a>7. SSR サポート

FreeEditor は、サーバーサイドレンダリング（SSR）環境でも安全に読み込むことができます。Vue SSR、Nuxt、Vite SSR、Node.js などのシーンに対応しています。サーバー側で npm パッケージを `import` しても、`window`、`document`、`navigator` などのブラウザ専用 API には一切触れません。ブラウザ固有のロジックは、実際に該当機能が実行されるまで遅延されるため、サーバー側でメインエントリを読み込んでもエラーにはなりません。

### 7.1 使用上の原則

SSR 環境でエディタを使用する場合は、以下の原則に従ってください。

- **サーバー側（SSR フェーズ）**：パッケージを安全に `import` するだけに留め（例：型や `i18n` の参照）、エディタインスタンスを**作成しない**でください。
- **ブラウザ側（クライアント）**：コンポーネントのマウント後（Vue の `onMounted`、React の `useEffect` など）に `new Editor()` で作成してください。
- サーバー側で誤って `new Editor()` を呼び出した場合は、問題の特定に役立つ明確な環境エラーが発生します。
- エクスポート・インポート（Word、PDF など）に必要な重い依存関係（`docx`、`mammoth`、`html2canvas`、`jspdf` など）は、動的 `import()` により必要時にのみ読み込まれます。

### 7.2 Vue 3 の例

Vue 3 では、`onMounted` でエディタを作成し、コンポーネントのアンマウント時に破棄することを推奨します。

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { Editor } from "@catmasks/free-editor";

let editor: Editor | null = null;
const editorEl = ref<HTMLElement | null>(null);

onMounted(() => {
  // エディタインスタンスはブラウザ側でのみ作成
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

### 7.3 Nuxt のヒント

Nuxt を使用する場合は、ビルトインの `<ClientOnly>` コンポーネントでエディタをラップするか、`<script setup>` 内で `import.meta.client` を確認し、エディタがクライアント側でのみレンダリング・マウントされるようにしてください。

### 7.4 サーバー側読み込みの検証

次の例は Node.js 環境で実行でき、SSR サーバーが npm パッケージを安全に読み込めることを検証します。

```typescript
import { Editor, i18n } from "@catmasks/free-editor";

// サーバー側で言語などを読み取ることは可能（ブラウザに依存しない）
console.log(i18n.locale);

// DOM が存在しない限り、ここで new Editor() を呼び出してはいけません
```

### 7.5 注意事項

- `style.css` はクライアント側で個別に読み込む必要があります。
- ビルド成果物の動的 `chunks/` ディレクトリは、`index.js` と一緒にデプロイする必要があります。
- SSR 環境で読み込む場合は、エディタインスタンスがブラウザ側でのみ作成されるようにしてください。

---
