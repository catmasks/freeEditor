import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../../ui/index";
import { i18n } from "../../core/index";

/**
 * 导入 Word 图标 SVG
 */
const IMPORT_WORD_ICON = `
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
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
  <polyline points="14 2 14 8 20 8" />
  <polyline points="7.5 11 8.5 15 10 12 11.5 15 12.5 11" />
  <line x1="16" y1="17" x2="16" y2="11" />
  <polyline points="13.5 13.5 16 11 18.5 13.5" />
</svg>
`;

/**
 * 创建导入 Word 工具栏按钮
 *
 * @param editor 编辑器实例
 * @returns 工具栏按钮元素
 */
export function createImportWordToolbar(editor: Editor): HTMLElement {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".docx";
  input.hidden = true;

  input.onchange = async (e: Event): Promise<void> => {
    const files = (e.target as HTMLInputElement).files;
    if (!files?.length) {
      return;
    }
    editor.commands.importWord(files[0]);
    input.value = "";
  };

  document.body.appendChild(input);

  return createSimpleToolbar({
    editor,
    iconSvg: IMPORT_WORD_ICON,
    tooltip: { text: i18n.t("word.import"), keyboard: "" },
    onClick: () => {
      input.click();
    },
  });
}
