import { i18n } from "@catmasks/free-editor";
import type { Locale } from "@catmasks/free-editor";

import { editor } from "./editor";
import {
  updateLocaleButtons,
  updateDemoTexts,
  updateButtonTexts,
  extendI18n,
} from "./i18n";

/**
 * 设置语言 / Set locale
 */
export function setLocale(locale: Locale): void {
  if (editor) {
    editor.setLocale(locale);
  } else {
    i18n.setLocale(locale); // [I18N-PUBLISH] 发布语言变化通知
  }

  updateLocaleButtons(locale);
  updateDemoTexts(locale);
  updateButtonTexts(locale);
}

/**
 * 初始化事件监听器 / Initialize event listeners
 */
export function initEventListeners(): void {
  const toggleBtn = document.getElementById("theme-toggle");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      editor?.toggleTheme();
    });
  }

  const getHtmlBtn = document.getElementById("get-html-btn");

  if (getHtmlBtn) {
    getHtmlBtn.addEventListener("click", () => {
      const html = editor?.getHtml();
      if (html) {
        const preview = document.getElementById("preview");
        if (preview) {
          preview.textContent = html;
        }
      }
    });
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
