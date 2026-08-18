import type { Editor } from "@tiptap/core";
import { createSelectToolbar } from "../toolbar";
import type { SelectOption } from "../../ui/index";

import { i18n } from "../../core/index";

/**
 * 字号下拉选项 / Font size dropdown options
 */
const getFontSizeOptions = (): SelectOption[] => [
  { value: null, label: i18n.t("fontSize.default") },
  { value: "12px", label: "12px" },
  { value: "14px", label: "14px" },
  { value: "16px", label: "16px" },
  { value: "18px", label: "18px" },
  { value: "20px", label: "20px" },
  { value: "24px", label: "24px" },
  { value: "28px", label: "28px" },
  { value: "32px", label: "32px" },
  { value: "36px", label: "36px" },
  { value: "48px", label: "48px" },
];

/**
 * 创建字号工具栏 / Create font size toolbar
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns Select 工具栏元素 / Select toolbar element
 */
export function createFontSizeToolbar(editor: Editor): HTMLElement {
  return createSelectToolbar({
    editor,
    options: getFontSizeOptions(),
    tooltip: i18n.t("toolbar.fontSize"),
    width: "auto",
    dropdownWidth: "80px",
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
