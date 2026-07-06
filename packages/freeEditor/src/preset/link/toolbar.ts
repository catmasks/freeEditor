import type { Editor } from "@tiptap/core";

import { createToolbarButton, createIcon } from "../../ui/index";

import { LinkDialog } from "./createLinkDialog";

/**
 * 创建链接工具栏按钮 / Create link toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素（带 destroy 方法）/ Toolbar button element (with destroy method)
 */
export function createLinkToolbar(editor: Editor) {
  const button = createToolbarButton(
    createIcon(`<svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>`),
    "链接",
  );

  const dialog = new LinkDialog({
    editor,

    target: button,
  });

  const render = () => {
    if (editor.isActive("link")) {
      button.classList.add("is-active");
    } else {
      button.classList.remove("is-active");
    }
  };

  button.addEventListener("click", () => {
    dialog.open();
  });

  editor.on("selectionUpdate", render);

  editor.on("transaction", render);

  render();

  const destroy = () => {
    editor.off("selectionUpdate", render);

    editor.off("transaction", render);

    dialog.destroy();
  };

  (
    button as typeof button & {
      destroy?: () => void;
    }
  ).destroy = destroy;

  return button;
}
