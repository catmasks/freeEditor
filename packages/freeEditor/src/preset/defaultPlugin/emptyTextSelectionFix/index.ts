import { Extension } from "@tiptap/core";
import {
  Plugin,
  PluginKey,
  TextSelection,
  AllSelection,
  type Transaction,
} from "@tiptap/pm/state";

/**
 * 空文本选区归一化插件 / Empty text selection normalization plugin
 */
const emptyTextSelectionFixKey = new PluginKey("emptyTextSelectionFix");

export const EmptyTextSelectionFix = Extension.create({
  name: "emptyTextSelectionFix",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: emptyTextSelectionFixKey,
        appendTransaction(
          _transactions,
          _oldState,
          newState,
        ): Transaction | null {
          const { selection, doc } = newState;
          /**
           * 空选区（正常光标）无需处理。
           */
          if (selection.empty) return null;
          if (
            !(selection instanceof TextSelection) &&
            !(selection instanceof AllSelection)
          ) {
            return null;
          }
          const { from, to } = selection;
          /** 选区内存在文本字符（正常选中内容）不处理，避免误折叠 */
          if (doc.textBetween(from, to).length !== 0) return null;
          /** 折叠光标：优先落在原 from；若 from 指向文档边界则回退到第一个合法可编辑位置 */
          const maxCursor = Math.max(1, doc.content.size - 1);
          const pos = Math.min(from < 1 ? to : from, maxCursor);
          try {
            /**
             * 使用 TextSelection.near 而非 create：
             * 空文档的 pos 可能指向 doc 节点（无 inline 内容），create 会抛异常，
             * near 会自动调整到最近的合法 TextSelection 位置。
             */
            const cursor = TextSelection.near(doc.resolve(Math.max(1, pos)), 1);
            if (!(cursor instanceof TextSelection)) return null;
            const tr = newState.tr.setSelection(cursor);
            /** 标记自身事务，避免在极端情况下再次触发归一化 */
            tr.setMeta("emptyTextSelectionFix", true);
            return tr;
          } catch {
            return null;
          }
        },
      }),
    ];
  },
});
