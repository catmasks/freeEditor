import type { Schema } from "@tiptap/pm/model";
import { MarkdownParser as PMMarkdownParser } from "prosemirror-markdown";
import { defaultTokenizer } from "./tokenizer";

/** 检查节点类型是否存在于 schema 中 */
function hasNode(schema: Schema, name: string): boolean {
  try {
    return !!schema.nodes[name];
  } catch {
    return false;
  }
}

/** 检查标记类型是否存在于 schema 中 */
function hasMark(schema: Schema, name: string): boolean {
  try {
    return !!schema.marks[name];
  } catch {
    return false;
  }
}

/**
 * 创建 Markdown 解析器，将 Markdown 字符串解析为 ProseMirror 文档节点。
 * 仅注册 schema 中实际存在的节点/标记映射，避免未知节点类型错误。
 */
export function createMarkdownParser(
  schema: Schema,
  extraTokens: Record<string, any> = {},
): PMMarkdownParser {
  const tokens: Record<string, any> = {
    ...(hasNode(schema, "heading") && {
      heading: {
        block: "heading",
        getAttrs: (tok: any) => ({ level: +tok.tag.slice(1) }),
      },
    }),
    ...(hasNode(schema, "paragraph") && {
      paragraph: { block: "paragraph" },
    }),
    ...(hasNode(schema, "bulletList") && {
      bullet_list: { block: "bulletList" },
    }),
    ...(hasNode(schema, "orderedList") && {
      ordered_list: {
        block: "orderedList",
        getAttrs: (tok: any) => ({ start: Number(tok.attrGet("start") ?? 1) }),
      },
    }),
    ...(hasNode(schema, "listItem") && {
      list_item: { block: "listItem" },
    }),
    ...(hasNode(schema, "blockquote") && {
      blockquote: { block: "blockquote" },
    }),
    ...(hasNode(schema, "codeBlock") && {
      fence: {
        block: "codeBlock",
        noClose: true,
        getAttrs: (tok: any) => ({ language: tok.info || null }),
      },
      code_block: {
        block: "codeBlock",
        noClose: true,
        getAttrs: () => ({ language: null }),
      },
    }),
    ...(hasNode(schema, "table") && {
      table: { block: "table" },
    }),
    ...(hasNode(schema, "tableRow") && {
      tr: { block: "tableRow" },
    }),
    ...(hasNode(schema, "tableHeader") && {
      th: {
        block: "tableHeader",
        getAttrs: (tok: any) => ({
          colspan: Number(tok.attrGet("colspan") ?? 1),
          rowspan: Number(tok.attrGet("rowspan") ?? 1),
        }),
      },
    }),
    ...(hasNode(schema, "tableCell") && {
      td: {
        block: "tableCell",
        getAttrs: (tok: any) => ({
          colspan: Number(tok.attrGet("colspan") ?? 1),
          rowspan: Number(tok.attrGet("rowspan") ?? 1),
        }),
      },
    }),
    ...(hasNode(schema, "lineBreak") && {
      hardbreak: { node: "lineBreak" },
    }),
    ...(hasNode(schema, "divider") && {
      hr: { node: "divider" },
    }),
    ...(hasMark(schema, "bold") && {
      strong: { mark: "bold" },
    }),
    ...(hasMark(schema, "italic") && {
      em: { mark: "italic" },
    }),
    ...(hasMark(schema, "strike") && {
      s: { mark: "strike" },
    }),
    ...(hasMark(schema, "inlineCode") && {
      code_inline: { mark: "inlineCode", noClose: true },
    }),
    ...(hasMark(schema, "link") && {
      link: {
        mark: "link",
        getAttrs: (tok: any) => ({
          href: tok.attrGet("href") || "",
          title: tok.attrGet("title") || null,
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        }),
      },
    }),
    ...(hasNode(schema, "image") && {
      image: {
        node: "image",
        getAttrs: (tok: any) => ({
          src: tok.attrGet("src") || "",
          alt: tok.attrGet("alt") || "",
          title: tok.attrGet("title") || "",
          type: "image",
          width: "150px",
          height: "auto",
        }),
      },
    }),
  };

  return new PMMarkdownParser(schema, defaultTokenizer, {
    ...tokens,
    ...extraTokens,
  });
}
