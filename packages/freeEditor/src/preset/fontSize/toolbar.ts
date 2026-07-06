import type { Editor } from "@tiptap/core";
import { createSelectToolbar } from "../toolbar";
import type { SelectOption } from "../../ui/index";

/**
 * 字号下拉选项 / Font size dropdown options
 */
const fontSizeOptions: SelectOption[] = [
  { value: null, label: "默认字号" },
  { value: "12px", label: "12px" },
  { value: "16px", label: "16px" },
  { value: "24px", label: "24px" },
];

/**
 * 创建字号工具栏 / Create font size toolbar
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns Select 工具栏元素 / Select toolbar element
 */
export function createFontSizeToolbar(editor: Editor) {
  return createSelectToolbar({
    editor,
    options: fontSizeOptions,
    tooltip: "字号",
    width: "auto",
    dropdownWidth: "72px",
    getValue: () => editor.getAttributes("style").fontSize || null,
    onChange: (value) => {
      if (value == null) {
        editor.chain().focus().unsetFontSize().run();
        return;
      }
      editor.chain().focus().setFontSize(String(value)).run();
    },
  });
}
