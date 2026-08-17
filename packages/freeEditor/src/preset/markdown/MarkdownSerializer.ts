import type { Schema } from "@tiptap/pm/model";
import type { MarkdownSerializer as PMMarkdownSerializer } from "prosemirror-markdown";
import type { MarkdownNodeSerializer, MarkdownMarkSerializer } from "./types";

/**
 * 动态加载 prosemirror-markdown。
 * @returns prosemirror-markdown 运行时模块
 * @throws 当 prosemirror-markdown 加载失败时抛出错误
 */
async function loadMarkdownSerializer(): Promise<
  typeof import("prosemirror-markdown")
> {
  try {
    return await import("prosemirror-markdown");
  } catch (error) {
    console.error("[Markdown] 加载 prosemirror-markdown 失败:", error);

    throw new Error(
      "Markdown 功能加载失败，请检查 prosemirror-markdown 是否正确安装。",
      {
        cause: error,
      },
    );
  }
}

/**
 * 创建 Markdown 序列化器，将 ProseMirror 节点序列化为 Markdown 字符串。
 *
 * 支持扩展机制：节点和标记可以注册自定义序列化器。
 *
 * @param schema - 当前 ProseMirror Schema
 * @param extraNodes - 自定义节点序列化器
 * @param extraMarks - 自定义标记序列化器
 * @returns Markdown 序列化器
 */
export async function createMarkdownSerializer(
  schema: Schema,
  extraNodes: Record<string, MarkdownNodeSerializer> = {},
  extraMarks: Record<string, MarkdownMarkSerializer> = {},
): Promise<PMMarkdownSerializer> {
  const { MarkdownSerializer } = await loadMarkdownSerializer();

  const defaultNodes: Record<string, (...args: any[]) => void> = {
    paragraph(state: any, node: any) {
      state.renderInline(node);
      state.closeBlock(node);
    },

    heading(state: any, node: any) {
      state.write(state.repeat("#", node.attrs.level) + " ");
      state.renderInline(node);
      state.closeBlock(node);
    },

    codeBlock(state: any, node: any) {
      const language = node.attrs.language || "";

      state.write("```" + language + "\n");
      state.text(node.textContent, false);
      state.ensureNewLine();
      state.write("```");
      state.closeBlock(node);
    },

    blockquote(state: any, node: any) {
      state.wrapBlock("> ", null, node, () => state.renderContent(node));
    },

    bulletList(state: any, node: any) {
      state.renderList(node, "  ", () => "- ");
    },

    orderedList(state: any, node: any) {
      const start = node.attrs.start || 1;

      state.renderList(node, "  ", (i: number) => `${start + i}. `);
    },

    listItem(state: any, node: any) {
      state.renderContent(node);
    },

    image(state: any, node: any) {
      const alt = state.esc(node.attrs.alt || "");
      const src = state.esc(node.attrs.src || "");

      const title = node.attrs.title ? ` "${state.esc(node.attrs.title)}"` : "";

      state.write(`![${alt}](${src}${title})`);

      if (node.type.spec.inline === false) {
        state.closeBlock(node);
      }
    },

    lineBreak(state: any, node: any, parent: any, index: number) {
      for (let i = index + 1; i < parent.childCount; i++) {
        if (parent.child(i).type !== node.type) {
          state.write("\\\n");

          return;
        }
      }
    },

    divider(state: any, node: any) {
      state.write("---");
      state.closeBlock(node);
    },

    table(state: any, node: any) {
      state.flushClose();
      state.write("|");
      state.closeBlock(node);
    },

    tableRow(state: any, node: any) {
      state.renderContent(node);
      state.closeBlock(node);
    },

    tableCell(state: any, node: any) {
      state.renderInline(node);
    },

    tableHeader(state: any, node: any) {
      state.renderInline(node);
    },

    text(state: any, node: any) {
      state.text(node.text ?? "");
    },
  };

  const defaultMarks: Record<string, MarkdownMarkSerializer> = {
    bold: {
      open: "**",
      close: "**",
      mixable: true,
      expelEnclosingWhitespace: true,
    },

    italic: {
      open: "*",
      close: "*",
      mixable: true,
      expelEnclosingWhitespace: true,
    },

    strike: {
      open: "~~",
      close: "~~",
      mixable: true,
      expelEnclosingWhitespace: true,
    },

    inlineCode: {
      open: "`",
      close: "`",
      mixable: false,
      expelEnclosingWhitespace: false,
    },

    link: {
      open: "[",
      close: (state: any, mark: any) => {
        const href = state.esc(mark.attrs.href || "");

        const title = mark.attrs.title
          ? ` "${state.esc(mark.attrs.title)}"`
          : "";

        return `](${href}${title})`;
      },
    },
  };

  const mergedNodes: Record<string, (...args: any[]) => void> = {
    ...defaultNodes,
  };

  for (const [name, serializer] of Object.entries(extraNodes)) {
    mergedNodes[name] = (state: any, node: any, parent: any, index: number) => {
      serializer.serialize(node, state, parent, index);
    };
  }

  return new MarkdownSerializer(mergedNodes, {
    ...defaultMarks,
    ...extraMarks,
  });
}
