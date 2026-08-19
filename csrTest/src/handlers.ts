// @ts-expect-error 忽略类型检查
import { i18n } from "@catmasks/free-editor";
// @ts-expect-error 忽略类型检查错误
import type { Locale } from "@catmasks/free-editor";

import { editor, toggleDisabled, toggleReadonly } from "./editor";
import {
  updateLocaleButtons,
  updateDemoTexts,
  updateButtonTexts,
  extendI18n,
} from "./i18n";

/**
 * 绑定点击事件到指定元素 / Bind a click handler to an element.
 */
function onClick(id: string, handler: () => void): void {
  document.getElementById(id)?.addEventListener("click", handler);
}

/**
 * 设置语言 / Set locale
 */
export function setLocale(locale: Locale): void {
  if (editor) {
    editor.setLocale(locale);
  } else {
    i18n.setLocale(locale);
  }

  updateLocaleButtons(locale);
  updateDemoTexts(locale);
  updateButtonTexts(locale);
}

/**
 * 初始化事件监听器 / Initialize event listeners
 */
export function initEventListeners(): void {
  onClick("theme-toggle", () => editor?.toggleTheme());

  onClick("get-html-btn", () => {
    const html = editor?.getHtml();
    const preview = document.getElementById("preview");
    if (!preview || !html) return;

    preview.classList.add("visible");
    preview.innerHTML = `<div class="preview-label">获取的HTML：</div><pre></pre>`;
    const pre = preview.querySelector("pre");
    if (pre) pre.textContent = html;
  });

  document.querySelectorAll<HTMLButtonElement>(".locale-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const locale = btn.getAttribute("data-locale") as Locale;
      if (locale) setLocale(locale);
    });
  });

  onClick("extend-i18n-btn", extendI18n);
  onClick("toggle-disabled", toggleDisabled);
  onClick("toggle-readonly", toggleReadonly);
}
