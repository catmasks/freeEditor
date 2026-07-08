import type { Editor } from "@tiptap/core";
import { createSelectToolbar } from "../toolbar";
import type { SelectOption } from "../../ui/index";

import { i18n } from "../../core/index";

/**
 * 字体下拉选项 / Font family dropdown options
 */
const getFontFamilyOptions = (): SelectOption[] => [
  { value: null, label: i18n.t("fontFamily.default") },
  { value: "sans-serif", label: i18n.t("fontFamily.sansSerif") },
  { value: "serif", label: i18n.t("fontFamily.serif") },
];

/**
 * 创建字体工具栏 / Create font family toolbar
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns Select 工具栏元素 / Select toolbar element
 */
export function createFontFamilyToolbar(editor: Editor) {
  return createSelectToolbar({
    editor,
    options: getFontFamilyOptions(),
    tooltip: i18n.t("toolbar.fontFamily"),
    width: "auto",
    dropdownWidth: "80px",
    getValue: () => editor.getAttributes("style").fontFamily || null,
    onChange: (value) => {
      if (value == null) {
        editor.chain().focus().unsetFontFamily().run();
        return;
      }
      editor.chain().focus().setFontFamily(String(value)).run();
    },
  });
}
