import type { Editor } from "@tiptap/core";
import { createSelectToolbar } from "../toolbar";
import type { SelectOption } from "../../ui/index";

import { i18n } from "../../core/utils/index";

/**
 * 字号下拉选项 / Font size dropdown options
 */
const getFontSizeOptions = (): SelectOption[] => [
  { value: null, label: i18n.t("fontSize.default") },
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
    options: getFontSizeOptions(),
    tooltip: i18n.t("toolbar.fontSize"),
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
