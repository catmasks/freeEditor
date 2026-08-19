// @ts-expect-error 忽略类型检查
import { i18n } from "@catmasks/free-editor";
// @ts-expect-error 忽略类型检查错误
import type { Locale } from "@catmasks/free-editor";

const pageI18n: Record<Locale, Record<string, string>> = {
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

function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export function getPageText(locale: Locale, key: string): string {
  return pageI18n[locale]?.[key] || key;
}

/** 映射：页面标签元素 id → 对应语言包 key */
const LABEL_MAP: [string, string][] = [
  ["demo-title", "demoTitle"],
  ["current-locale-label", "currentLocaleLabel"],
  ["bold-label", "boldLabel"],
  ["italic-label", "italicLabel"],
  ["placeholder-label", "placeholderLabel"],
  ["confirm-label", "confirmLabel"],
  ["cancel-label", "cancelLabel"],
  ["heading-label", "headingLabel"],
];

/** 映射：翻译示例元素 id → 编辑器内置 i18n key */
const DEMO_KEY_MAP: [string, string][] = [
  ["demo-bold", "toolbar.bold"],
  ["demo-italic", "toolbar.italic"],
  ["demo-placeholder", "common.placeholder"],
  ["demo-confirm", "common.confirm"],
  ["demo-cancel", "common.cancel"],
  ["demo-heading-body", "heading.body"],
];

export function updateDemoTexts(locale: Locale): void {
  setText("current-locale", locale);

  LABEL_MAP.forEach(([id, key]) => {
    setText(id, getPageText(locale, key));
  });

  DEMO_KEY_MAP.forEach(([id, key]) => {
    setText(id, i18n.t(key));
  });
}

/** 映射：按钮元素 id → 对应语言包 key */
const BUTTON_MAP: [string, string][] = [
  ["theme-toggle", "themeToggle"],
  ["get-html-btn", "getHtml"],
  ["locale-label", "localeLabel"],
  ["extend-i18n-btn", "extendI18n"],
];

export function updateButtonTexts(locale: Locale): void {
  BUTTON_MAP.forEach(([id, key]) => {
    setText(id, getPageText(locale, key));
  });
}

export function updateLocaleButtons(locale: Locale): void {
  document.querySelectorAll<HTMLButtonElement>(".locale-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-locale") === locale);
  });
}

const customTexts: Record<Locale, { bold: string; italic: string }> = {
  "zh-CN": { bold: "自定义粗体", italic: "自定义斜体" },
  en: { bold: "Custom Bold", italic: "Custom Italic" },
  "ja-JP": { bold: "カスタム太字", italic: "カスタム斜体" },
};

export function initCustomI18n(): void {
  i18n.extend({
    toolbar: customTexts[i18n.locale],
  });
}

export function extendI18n(): void {
  const locale = i18n.locale;
  i18n.extend({
    toolbar: { bold: customTexts[locale].bold },
  });
  alert(getPageText(locale, "extendTip"));
  updateDemoTexts(locale);
}
