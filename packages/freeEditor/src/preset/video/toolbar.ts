import type { Editor } from "@tiptap/core";

import { createSimpleToolbar } from "../toolbar";

/**
 * 视频图标 SVG / Video icon SVG
 */
const VIDEO_ICON = `
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
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
`;

/**
 * 创建视频工具栏按钮 / Create video toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createVideoToolbar(editor: Editor) {
  const input = document.createElement("input");

  input.type = "file";

  input.accept = "video/*";

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

        "video",
      );
    } catch (error) {
      console.error(error);
    }

    input.value = "";
  };

  document.body.appendChild(input);

  return createSimpleToolbar({
    editor,

    iconSvg: VIDEO_ICON,

    tooltip: "视频",

    onClick: () => {
      input.click();
    },
  });
}
