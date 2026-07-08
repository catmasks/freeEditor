import type { Editor } from "@tiptap/core";
import { createSelectToolbar } from "../toolbar";
import type { SelectOption } from "../../ui/index";

import { i18n } from "../../core/index";

/**
 * 标题下拉选项 / Heading dropdown options
 */
const getHeadingOptions = (): SelectOption[] => [
  { label: i18n.t("heading.body"), value: null },
  { label: "H1", value: 1 },
  { label: "H2", value: 2 },
  { label: "H3", value: 3 },
  { label: "H4", value: 4 },
  { label: "H5", value: 5 },
  { label: "H6", value: 6 },
];

/**
 * 获取当前标题等级 / Get current heading level
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 标题等级或 null / Heading level or null
 */
function getHeadingLevel(editor: Editor): number | null {
  for (let i = 1; i <= 6; i++) {
    if (editor.isActive("heading", { level: i })) {
      return i;
    }
  }
  return null;
}

/**
 * 创建标题工具栏 / Create heading toolbar
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns Select 工具栏元素 / Select toolbar element
 */
export function createHeadingToolbar(editor: Editor) {
  return createSelectToolbar({
    editor,
    options: getHeadingOptions(),
    tooltip: i18n.t("toolbar.heading"),
    width: "auto",
    dropdownWidth: "80px",
    getValue: () => getHeadingLevel(editor),
    onChange: (value) => {
      if (value == null) {
        editor.chain().focus().unsetHeading().run();
        return;
      }
      editor
        .chain()
        .focus()
        .setHeading({ level: Number(value) as 1 | 2 | 3 | 4 | 5 | 6 })
        .run();
    },
  });
}
