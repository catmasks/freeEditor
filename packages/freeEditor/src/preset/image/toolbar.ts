import type { Editor } from "@tiptap/core";

import { createSimpleToolbar } from "../toolbar";

/**
 * 图片图标 SVG / Image icon SVG
 */
const IMAGE_ICON = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path
      d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10l-3.1-3.1a2 2 0 0 0-2.814.014L6 21"
    />
    <path d="m14 19.5 3-3 3 3" />
    <path d="M17 22v-5.5" />
    <circle cx="9" cy="9" r="2" />
  </svg>
`;

/**
 * 创建图片工具栏按钮 / Create image toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createImageToolbar(editor: Editor) {
  const input = document.createElement("input");

  input.type = "file";

  input.accept = "image/*";

  input.hidden = true;

  input.onchange = async (e) => {
    const files = (e.target as HTMLInputElement).files;

    if (!files?.length) {
      return;
    }

    const file = files[0];

    try {
      await editor.storage?.mediaUploader?.upload(
        file,

        "image",
      );
    } catch (error) {
      console.error(error);
    }

    input.value = "";
  };

  document.body.appendChild(input);

  return createSimpleToolbar({
    editor,

    iconSvg: IMAGE_ICON,

    tooltip: "图片",

    onClick: () => {
      input.click();
    },
  });
}
