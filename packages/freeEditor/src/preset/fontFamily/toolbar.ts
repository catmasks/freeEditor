import type { Editor } from "@tiptap/core";
import { createSelectToolbar } from "../toolbar";
import type { SelectOption } from "../../ui/index";

import { i18n } from "../../core/index";

/**
 * 字体下拉选项 / Font family dropdown options
 *
 * 使用系统原生字体，不引入任何字体文件。
 */
const getFontFamilyOptions = (): SelectOption[] => [
  {
    value: null,
    label: i18n.t("fontFamily.default"),
  },
  {
    value:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    label: i18n.t("fontFamily.system"),
  },
  {
    value: "sans-serif",
    label: i18n.t("fontFamily.sansSerif"),
  },
  {
    value: "serif",
    label: i18n.t("fontFamily.serif"),
  },
  {
    value: "monospace",
    label: i18n.t("fontFamily.monospace"),
  },
  {
    value: "Arial, sans-serif",
    label: "Arial",
  },
  {
    value: "Helvetica, Arial, sans-serif",
    label: "Helvetica",
  },
  {
    value: "Verdana, sans-serif",
    label: "Verdana",
  },
  {
    value: "Tahoma, sans-serif",
    label: "Tahoma",
  },
  {
    value: "Georgia, serif",
    label: "Georgia",
  },
  {
    value: "'Times New Roman', Times, serif",
    label: "Times New Roman",
  },
  {
    value: "'Courier New', Courier, monospace",
    label: "Courier New",
  },
];

/**
 * 创建字体工具栏 / Create font family toolbar
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns Select 工具栏元素 / Select toolbar element
 */
export function createFontFamilyToolbar(editor: Editor): HTMLElement {
  return createSelectToolbar({
    editor,
    options: getFontFamilyOptions(),
    tooltip: i18n.t("toolbar.fontFamily"),
    width: "auto",
    dropdownWidth: "100px",
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
