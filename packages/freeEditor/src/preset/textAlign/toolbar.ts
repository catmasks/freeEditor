import type { Editor } from "@tiptap/core";
import { createSelectToolbar } from "../toolbar";
import type { SelectOption } from "../../ui/index";

import { i18n } from "../../core/index";

const getTextAlignOptions = (): SelectOption[] => [
  { value: null, label: i18n.t("textAlign.default") },
  { value: "left", label: i18n.t("textAlign.left") },
  { value: "center", label: i18n.t("textAlign.center") },
  { value: "right", label: i18n.t("textAlign.right") },
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
