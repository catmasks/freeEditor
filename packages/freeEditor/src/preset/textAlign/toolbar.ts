import type { Editor } from "@tiptap/core";
import { createSelectToolbar } from "../toolbar";
import type { SelectOption } from "../../ui/index";

import { createIcon } from "../../ui/components/icon";

import { i18n } from "../../core/index";

/**
 * 默认对齐图标 SVG / Default align icon SVG
 */
const ALIGN_DEFAULT_ICON = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="18" y2="18" />
  </svg>
`;

/**
 * 左对齐图标 SVG / Left align icon SVG
 */
const ALIGN_LEFT_ICON = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="18" y2="18" />
  </svg>
`;

/**
 * 居中对齐图标 SVG / Center align icon SVG
 */
const ALIGN_CENTER_ICON = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="6" y1="12" x2="18" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
`;

/**
 * 右对齐图标 SVG / Right align icon SVG
 */
const ALIGN_RIGHT_ICON = `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="9" y1="12" x2="21" y2="12" />
    <line x1="6" y1="18" x2="21" y2="18" />
  </svg>
`;

/**
 * 创建带图标的选项标签 DOM / Create option label DOM with icon
 * @param iconSvg 图标 SVG 字符串 / Icon SVG string
 * @param labelText 标签文字 / Label text
 * @param tooltip 提示文本 / Tooltip text
 * @returns 标签 DOM 元素 / Label DOM element
 */
function createOptionLabel(
  iconSvg: string,
  labelText: string,
  tooltip?: string,
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.gap = "6px";
  wrapper.style.width = "100%";

  const iconEl = createIcon(iconSvg);
  iconEl.style.flexShrink = "0";
  wrapper.appendChild(iconEl);

  const textEl = document.createElement("span");
  textEl.textContent = labelText;
  wrapper.appendChild(textEl);

  if (tooltip) {
    wrapper.title = tooltip;
  }

  return wrapper;
}

const getTextAlignOptions = (): SelectOption[] => [
  {
    value: null,
    label: createOptionLabel(
      ALIGN_DEFAULT_ICON,
      i18n.t("textAlign.default"),
      i18n.t("textAlign.defaultTooltip"),
    ),
  },
  {
    value: "left",
    label: createOptionLabel(
      ALIGN_LEFT_ICON,
      i18n.t("textAlign.left"),
      i18n.t("textAlign.leftTooltip"),
    ),
  },
  {
    value: "center",
    label: createOptionLabel(
      ALIGN_CENTER_ICON,
      i18n.t("textAlign.center"),
      i18n.t("textAlign.centerTooltip"),
    ),
  },
  {
    value: "right",
    label: createOptionLabel(
      ALIGN_RIGHT_ICON,
      i18n.t("textAlign.right"),
      i18n.t("textAlign.rightTooltip"),
    ),
  },
];

function getCurrentTextAlign(editor: Editor): string | null {
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  for (let d = $from.depth; d >= 0; d--) {
    const node = $from.node(d);
    if (node && ["paragraph", "heading"].includes(node.type.name)) {
      return node.attrs.textAlign || null;
    }
  }

  return null;
}

export function createTextAlignToolbar(editor: Editor) {
  return createSelectToolbar({
    editor,
    options: getTextAlignOptions(),
    tooltip: i18n.t("toolbar.textAlign"),
    width: "auto",
    dropdownWidth: "80px",
    getValue: () => getCurrentTextAlign(editor),
    onChange: (value) => {
      if (value == null) {
        editor.chain().focus().unsetTextAlign().run();
        return;
      }
      editor.chain().focus().setTextAlign(String(value)).run();
    },
  });
}
