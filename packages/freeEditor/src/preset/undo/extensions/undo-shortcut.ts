import { Extension } from "@tiptap/core";

/**
 * 撤销快捷键扩展 / Undo shortcut extension
 *
 * 仅负责 undo/redo 快捷键，可被 include/exclude 控制。
 */
export const UndoShortcut = Extension.create({
  /** 扩展名称 / Extension name */
  name: "undoShortcut",

  /** 添加键盘快捷键 / Add keyboard shortcuts */
  addKeyboardShortcuts() {
    return {
      /** Ctrl+Z 撤销 */
      "Mod-z": () => this.editor.commands.undo(),
      /** Ctrl+Y 重做 */
      "Mod-y": () => this.editor.commands.redo(),
    };
  },
});
