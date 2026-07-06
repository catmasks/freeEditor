import type { Editor } from "@tiptap/core";
import { createSelectToolbar } from "../toolbar";
import type { SelectOption } from "../../ui/index";

/**
 * 字体下拉选项 / Font family dropdown options
 */
const fontFamilyOptions: SelectOption[] = [
  { value: null, label: "默认字体" },
  { value: "sans-serif", label: "无衬线体" },
  { value: "serif", label: "衬线体" },
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
    options: fontFamilyOptions,
    tooltip: "字体",
    width: "auto",
    dropdownWidth: "72px",
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
