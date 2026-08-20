import type { Editor } from "@tiptap/core";
import { createSelectToolbar } from "../../ui/index";
import { createIcon } from "../../ui/index";
import type { SelectOption } from "../../ui/index";

import { i18n } from "../../core/index";
const LINE_HEIGHTS_DEFAULT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h8"/><path d="M3 12h8"/><path d="M3 19h8"/><path d="m15 8 3-3 3 3"/><path d="m15 16 3 3 3-3"/></svg>`;
/**
 * 创建带图标的选项标签 DOM / Create option label DOM with icon
 * @param iconSvg 图标 SVG 字符串 / Icon SVG string
 * @returns 标签 DOM 元素 / Label DOM element
 */
function createOptionLabel(iconSvg: string): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "6px";
  wrapper.style.width = "100%";
  wrapper.style.pointerEvents = "none";

  const iconEl = createIcon(iconSvg);
  iconEl.style.flexShrink = "0";
  wrapper.appendChild(iconEl);

  return wrapper;
}
/**
 * 行高下拉选项 / Line height dropdown options
 */
const getLineHeightOptions = (): SelectOption[] => [
  {
    value: null,
    label: createOptionLabel(LINE_HEIGHTS_DEFAULT_ICON),
    tooltip: i18n.t("lineHeight.default"),
  },
  { value: "1", label: "1" },
  { value: "1.15", label: "1.15" },
  { value: "1.5", label: "1.5" },
  { value: "1.75", label: "1.75" },
  { value: "2", label: "2" },
  { value: "2.5", label: "2.5" },
  { value: "3", label: "3" },
];

/**
 * 获取当前行高 / Get current line height
 * @param editor 编辑器实例 / Editor instance
 * @returns 当前行高值或 null / Current line height value or null
 */
function getCurrentLineHeight(editor: Editor): string | null {
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  for (let d = $from.depth; d >= 0; d--) {
    const node = $from.node(d);
    if (node && ["paragraph", "heading"].includes(node.type.name)) {
      return node.attrs.lineHeight || null;
    }
  }

  return null;
}

/**
 * 创建行高工具栏 / Create line height toolbar
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns Select 工具栏元素 / Select toolbar element
 */
export function createLineHeightToolbar(editor: Editor): HTMLElement {
  return createSelectToolbar({
    editor,
    options: getLineHeightOptions(),
    tooltip: i18n.t("toolbar.lineHeight"),
    width: "auto",
    dropdownWidth: "auto",
    getValue: () => getCurrentLineHeight(editor),
    onChange: (value) => {
      if (value == null) {
        editor.chain().focus().unsetLineHeight().run();
        return;
      }
      editor.chain().focus().setLineHeight(String(value)).run();
    },
  });
}
