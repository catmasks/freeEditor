import "@catmasks/free-editor/style.css";
import "./style.css";

import { initEditor, destroyEditor } from "./editor";
import { updateButtonTexts } from "./i18n";
import { initEventListeners } from "./handlers";

document.addEventListener("DOMContentLoaded", () => {
  initEditor();

  const app = document.getElementById("app");
  if (app) {
    app.classList.add("dark");
  }

  initEventListeners();
  updateButtonTexts("zh-CN");
});

window.addEventListener("beforeunload", () => {
  destroyEditor();
});
