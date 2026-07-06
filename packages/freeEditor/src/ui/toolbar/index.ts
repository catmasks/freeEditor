import type { Editor } from "@tiptap/core";

import type { EditorPlugin } from "../../core";

import { ensureEditorFocus } from "../../core/index";

/**
 * 创建编辑器工具栏 / Create editor toolbar
 * @param editor - 编辑器实例 / Editor instance
 * @param plugins - 编辑器插件列表 / Editor plugin list
 * @returns 工具栏 DOM 元素 / Toolbar DOM element
 */
export function createToolbar(
  editor: Editor,

  plugins: EditorPlugin[],
) {
  const toolbar = document.createElement("div");

  toolbar.className = "free-editor__toolbar";

  plugins.forEach((plugin) => {
    if (!plugin.toolbar) {
      return;
    }

    const el = plugin.toolbar(editor);

    toolbar.appendChild(el);
  });

  toolbar.addEventListener("pointerdown", () => {
    ensureEditorFocus(editor);
  });

  return toolbar;
}
