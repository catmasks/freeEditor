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
): HTMLElement {
  const toolbar = document.createElement("div");

  toolbar.className = "free-editor__toolbar";

  plugins.forEach((plugin) => {
    if (!plugin.toolbar) {
      return;
    }

    const el = plugin.toolbar(editor);

    toolbar.appendChild(el);
  });

  toolbar.addEventListener("pointerdown", (event) => {
    const target = event.target as HTMLElement | null;

    // 表单控件（输入框/下拉等）需要获得焦点才能操作,
    // 其余工具栏控件是自定义 DIV/SVG，不可聚焦，浏览器 mousedown 默认行为会把
    // 文档焦点清空到 body，导致编辑区失焦点。这里 preventDefault 阻止该默认行为以保持编辑区焦点。
    if (target?.closest("input, textarea, select")) {
      return;
    }

    event.preventDefault();

    ensureEditorFocus(editor);
  });

  return toolbar;
}
