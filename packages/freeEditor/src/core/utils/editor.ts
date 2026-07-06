import type { Editor } from "@tiptap/core";

/**
 * 确保编辑器获得焦点 / Ensure editor is focused
 * @param editor 编辑器实例 / Editor instance
 */
export function ensureEditorFocus(editor: Editor): void {
  if (editor.isFocused) {
    return;
  }

  if (editor.state.selection.empty) {
    const doc = editor.state.doc;
    const pos = doc.content.size;

    editor.commands.setTextSelection(pos);
  }

  editor.commands.focus();
}
