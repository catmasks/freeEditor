import { InputRule, textblockTypeInputRule, wrappingInputRule } from "@tiptap/core";
import type { Schema } from "@tiptap/pm/model";

/**
 * 创建 Markdown 输入规则，支持实时输入转换：
 * # / ## / ### -> 标题, - / * -> 无序列表, > -> 引用, @ -> 提及
 */
export function createMarkdownInputRules(schema: Schema): InputRule[] {
  const rules: InputRule[] = [];

  if (schema.nodes.heading) {
    rules.push(
      ...[1, 2, 3].map(level =>
        textblockTypeInputRule({ find: new RegExp(`^(#{${level}})\\s$`), type: schema.nodes.heading, getAttributes: { level } }),
      ),
    );
  }

  if (schema.nodes.bulletList && schema.nodes.listItem) {
    rules.push(
      new InputRule({
        find: /^[-*]\s$/,
        handler: ({ state, range, chain }) => {
          const $from = state.doc.resolve(range.from);
          if ($from.parentOffset > 0) return null;
          chain().wrapInList("bulletList").run();
          return null;
        },
      }),
    );
  }

  if (schema.nodes.blockquote) {
    rules.push(wrappingInputRule({ find: /^>\s$/, type: schema.nodes.blockquote }));
  }

  rules.push(
    new InputRule({
      find: /^@\s$/,
      handler: ({ state, range }) => {
        const $from = state.doc.resolve(range.from);
        if ($from.parentOffset > 0) return null;
        state.tr.delete(range.from, range.to);
        return null;
      },
    }),
  );

  return rules;
}