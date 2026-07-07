import { Editor, i18n } from "@catmasks/free-editor";
import type {
  UploadResult,
  UploadContext,
  Locale,
} from "@catmasks/free-editor";
import "@catmasks/free-editor/style.css";

let editor: Editor | null = null;

const pageI18n = {
  "zh-CN": {
    title: "国际化功能演示",
    themeToggle: "切换主题",
    getHtml: "获取HTML",
    localeLabel: "语言切换：",
    extendI18n: "自定义文案",
    currentLocaleLabel: "当前语言：",
    boldLabel: "粗体按钮 tooltip：",
    italicLabel: "斜体按钮 tooltip：",
    placeholderLabel: "占位符文本：",
    confirmLabel: "确认按钮：",
    cancelLabel: "取消按钮：",
    headingLabel: "标题下拉：",
    demoTitle: "国际化功能演示",
    extendTip: "已自定义「粗体」文案为「自定义粗体」",
  },
  en: {
    title: "i18n Demo",
    themeToggle: "Toggle Theme",
    getHtml: "Get HTML",
    localeLabel: "Language:",
    extendI18n: "Custom Text",
    currentLocaleLabel: "Current Locale:",
    boldLabel: "Bold button tooltip:",
    italicLabel: "Italic button tooltip:",
    placeholderLabel: "Placeholder text:",
    confirmLabel: "Confirm button:",
    cancelLabel: "Cancel button:",
    headingLabel: "Heading dropdown:",
    demoTitle: "Internationalization Demo",
    extendTip: 'Custom "bold" text set to "Custom Bold"',
  },
  "ja-JP": {
    title: "国際化機能デモ",
    themeToggle: "テーマ切替",
    getHtml: "HTML取得",
    localeLabel: "言語切替：",
    extendI18n: "カスタム文言",
    currentLocaleLabel: "現在の言語：",
    boldLabel: "太字ボタン tooltip：",
    italicLabel: "斜体ボタン tooltip：",
    placeholderLabel: "プレースホルダーテキスト：",
    confirmLabel: "確定ボタン：",
    cancelLabel: "キャンセルボタン：",
    headingLabel: "見出しドロップダウン：",
    demoTitle: "国際化機能デモ",
    extendTip: "「太字」の文言を「カスタム太字」に変更しました",
  },
};

function getPageText(locale: Locale, key: string): string {
  return (pageI18n as any)[locale]?.[key] || key;
}

function updateDemoTexts(locale: Locale) {
  const demoTitle = document.getElementById("demo-title");
  const currentLocaleLabel = document.getElementById("current-locale-label");
  const currentLocale = document.getElementById("current-locale");
  const boldLabel = document.getElementById("bold-label");
  const italicLabel = document.getElementById("italic-label");
  const placeholderLabel = document.getElementById("placeholder-label");
  const confirmLabel = document.getElementById("confirm-label");
  const cancelLabel = document.getElementById("cancel-label");
  const headingLabel = document.getElementById("heading-label");
  const demoBold = document.getElementById("demo-bold");
  const demoItalic = document.getElementById("demo-italic");
  const demoPlaceholder = document.getElementById("demo-placeholder");
  const demoConfirm = document.getElementById("demo-confirm");
  const demoCancel = document.getElementById("demo-cancel");
  const demoHeadingBody = document.getElementById("demo-heading-body");

  if (demoTitle) demoTitle.textContent = getPageText(locale, "demoTitle");
  if (currentLocaleLabel)
    currentLocaleLabel.textContent = getPageText(locale, "currentLocaleLabel");
  if (currentLocale) currentLocale.textContent = locale;
  if (boldLabel) boldLabel.textContent = getPageText(locale, "boldLabel");
  if (italicLabel) italicLabel.textContent = getPageText(locale, "italicLabel");
  if (placeholderLabel)
    placeholderLabel.textContent = getPageText(locale, "placeholderLabel");
  if (confirmLabel)
    confirmLabel.textContent = getPageText(locale, "confirmLabel");
  if (cancelLabel) cancelLabel.textContent = getPageText(locale, "cancelLabel");
  if (headingLabel)
    headingLabel.textContent = getPageText(locale, "headingLabel");
  if (demoBold) demoBold.textContent = i18n.t("toolbar.bold");
  if (demoItalic) demoItalic.textContent = i18n.t("toolbar.italic");
  if (demoPlaceholder)
    demoPlaceholder.textContent = i18n.t("common.placeholder");
  if (demoConfirm) demoConfirm.textContent = i18n.t("common.confirm");
  if (demoCancel) demoCancel.textContent = i18n.t("common.cancel");
  if (demoHeadingBody) demoHeadingBody.textContent = i18n.t("heading.body");
}

function updateButtonTexts(locale: Locale) {
  const themeToggle = document.getElementById("theme-toggle");
  const getHtmlBtn = document.getElementById("get-html-btn");
  const localeLabel = document.getElementById("locale-label");
  const extendI18nBtn = document.getElementById("extend-i18n-btn");

  if (themeToggle) themeToggle.textContent = getPageText(locale, "themeToggle");
  if (getHtmlBtn) getHtmlBtn.textContent = getPageText(locale, "getHtml");
  if (localeLabel) localeLabel.textContent = getPageText(locale, "localeLabel");
  if (extendI18nBtn)
    extendI18nBtn.textContent = getPageText(locale, "extendI18n");
}

function updateLocaleButtons(locale: Locale) {
  const buttons = document.querySelectorAll<HTMLButtonElement>(".locale-btn");
  buttons.forEach((btn) => {
    const btnLocale = btn.getAttribute("data-locale");
    btn.classList.toggle("active", btnLocale === locale);
  });
}

function initEditor() {
  const container = document.getElementById("editor-container");

  if (!container) {
    return;
  }

  editor = new Editor(container, {
    content: "",
    theme: "dark",
    locale: "zh-CN",
    uploader: {
      image: {
        maxSize: 5 * 1024 * 1024,
        accept: ["png"],
        format(result: any) {
          console.log("响应数据", result);
          return {
            url: result.data,
          };
        },
        async upload(file: File, ctx: UploadContext) {
          console.log("[image upload]", file);

          return new Promise<UploadResult>((resolve, reject) => {
            setTimeout(() => {
              if (ctx.signal?.aborted) {
                reject(new Error("Upload canceled"));

                return;
              }
              resolve({
                url: URL.createObjectURL(file),
              });
            }, 3000);
          });
        },
      },

      video: {
        maxSize: 500 * 1024 * 1024,
        accept: ["video/*"],
        onUploadError(error, file) {
          console.error("[video upload error]", error.message, file);
          alert(i18n.t("upload.uploadFailed"));
        },
        onSuccess(result, file) {
          console.log("[video upload success]", result, file);
        },
        async upload(file: File, ctx: UploadContext) {
          console.log("[video upload]", file);

          return new Promise<UploadResult>((resolve, reject) => {
            setTimeout(() => {
              if (ctx.signal?.aborted) {
                reject(new Error("Upload canceled"));

                return;
              }

              resolve({
                url: URL.createObjectURL(file),
              });
            }, 3000);
          });
        },
      },

      file: {
        accept: [".pdf", ".doc", ".docx", ".zip"],
        onUploadError(error, file) {
          console.error("[file upload error]", error.message, file);
          alert(i18n.t("upload.uploadFailed"));
        },
        onSuccess(result, file) {
          console.log("[file upload success]", result, file);
        },
        async upload(file: File, ctx: UploadContext) {
          console.log("[file upload]", file);

          return new Promise<UploadResult>((resolve, reject) => {
            setTimeout(() => {
              if (ctx.signal?.aborted) {
                reject(new Error("Upload canceled"));

                return;
              }

              resolve({
                url: URL.createObjectURL(file),
              });
            }, 2000);
          });
        },
      },
    },
  });

  updateDemoTexts("zh-CN");
}

function toggleDark() {
  editor?.toggleTheme();
}

function getHtml() {
  const html = editor?.getHtml();

  if (html) {
    const preview = document.getElementById("preview");
    if (preview) {
      preview.textContent = html;
    }
  }
}

function setLocale(locale: Locale) {
  if (editor) {
    editor.setLocale(locale);
  } else {
    i18n.setLocale(locale);
  }

  updateLocaleButtons(locale);
  updateDemoTexts(locale);
  updateButtonTexts(locale);
}

function extendI18n() {
  const locale = i18n.getLocale();
  const customBold: Record<Locale, string> = {
    "zh-CN": "自定义粗体",
    en: "Custom Bold",
    "ja-JP": "カスタム太字",
  };

  i18n.extend({
    toolbar: {
      bold: customBold[locale],
    },
  });

  alert(getPageText(locale, "extendTip"));
  updateDemoTexts(locale);
}

function initEventListeners() {
  const toggleBtn = document.getElementById("theme-toggle");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleDark);
  }

  const getHtmlBtn = document.getElementById("get-html-btn");

  if (getHtmlBtn) {
    getHtmlBtn.addEventListener("click", getHtml);
  }

  const localeButtons =
    document.querySelectorAll<HTMLButtonElement>(".locale-btn");
  localeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const locale = btn.getAttribute("data-locale") as Locale;
      if (locale) {
        setLocale(locale);
      }
    });
  });

  const extendI18nBtn = document.getElementById("extend-i18n-btn");
  if (extendI18nBtn) {
    extendI18nBtn.addEventListener("click", extendI18n);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initEditor();
  const app = document.getElementById("app");
  if (app) {
    app.classList.toggle("dark");
  }

  initEventListeners();
  updateButtonTexts("zh-CN");
});

window.addEventListener("beforeunload", () => {
  editor?.destroy();

  editor = null;
});
