import "@catmasks/free-editor/style.css";

import { initEditor, destroyEditor } from "./editor";
import { initCustomI18n, updateButtonTexts } from "./i18n";
import { initEventListeners } from "./handlers";

document.addEventListener("DOMContentLoaded", () => {
  initCustomI18n();

  initEditor();

  const app = document.getElementById("app");
  if (app) {
    app.classList.toggle("dark");
  }

  initEventListeners();
  updateButtonTexts("zh-CN");
});

window.addEventListener("beforeunload", () => {
  destroyEditor();
});
