import type { Editor } from "@tiptap/core";
import { createSelectToolbar } from "../toolbar";
import type { SelectOption } from "../../ui/index";

import { createIcon } from "../../ui/components/icon";

import { i18n } from "../../core/index";

/**
 * 默认对齐图标 SVG / Default align icon SVG
 */
const ALIGN_DEFAULT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18"/><path d="M3 12h18"/><path d="M3 19h18"/></svg>`;

/**
 * 左对齐图标 SVG / Left align icon SVG
 */
const ALIGN_LEFT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H3"/><path d="M15 12H3"/><path d="M17 19H3"/></svg>`;

/**
 * 居中对齐图标 SVG / Center align icon SVG
 */
const ALIGN_CENTER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H3"/><path d="M17 12H7"/><path d="M19 19H5"/></svg>`;

/**
 * 右对齐图标 SVG / Right align icon SVG
 */
const ALIGN_RIGHT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H3"/><path d="M21 12H9"/><path d="M21 19H7"/></svg>`;

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

const getAlignmentOptions = (): SelectOption[] => [
  {
    value: null,
    label: createOptionLabel(ALIGN_DEFAULT_ICON),
    tooltip: i18n.t("alignment.default"),
  },
  {
    value: "left",
    label: createOptionLabel(ALIGN_LEFT_ICON),
    tooltip: i18n.t("alignment.left"),
  },
  {
    value: "center",
    label: createOptionLabel(ALIGN_CENTER_ICON),
    tooltip: i18n.t("alignment.center"),
  },
  {
    value: "right",
    label: createOptionLabel(ALIGN_RIGHT_ICON),
    tooltip: i18n.t("alignment.right"),
  },
];

function getCurrentAlignment(editor: Editor): string | null {
  const { state } = editor;
  const { selection } = state;
  const { $from } = selection;

  for (let d = $from.depth; d >= 0; d--) {
    const node = $from.node(d);
    if (node && ["paragraph", "heading"].includes(node.type.name)) {
      return node.attrs.alignment || null;
    }
  }

  return null;
}

export function createAlignmentToolbar(editor: Editor) {
  return createSelectToolbar({
    editor,
    options: getAlignmentOptions(),
    tooltip: i18n.t("toolbar.alignment"),
    width: "auto",
    dropdownWidth: "auto",
    getValue: () => getCurrentAlignment(editor),
    onChange: (value) => {
      if (value == null) {
        editor.chain().focus().unsetAlignment().run();
        return;
      }
      editor.chain().focus().setAlignment(String(value)).run();
    },
  });
}
