import type { Editor } from "@tiptap/core";

import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

import { handleUploadFiles } from "../../core/utils/useMediaUploader";

/**
 * 附件图标 SVG / Attachment icon SVG
 */
const ATTACHMENT_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"/></svg>
`;

/**
 * 创建附件工具栏按钮 / Create attachment toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createAttachmentToolbar(editor: Editor) {
  const input = document.createElement("input");

  input.type = "file";

  input.accept = "*/*";

  input.multiple = true;

  input.hidden = true;

  input.onchange = async (e) => {
    const files = (e.target as HTMLInputElement).files;

    if (!files?.length) {
      return;
    }

    try {
      await handleUploadFiles(editor, files, "attachment");
    } catch (error) {
      console.error(error);
    }

    input.value = "";
  };

  document.body.appendChild(input);

  return createSimpleToolbar({
    editor,

    iconSvg: ATTACHMENT_ICON,

    tooltip: i18n.t("toolbar.attachment"),

    onClick: () => {
      input.click();
    },
  });
}
