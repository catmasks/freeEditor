import type { Schema } from "@tiptap/pm/model";
import type {
  MarkdownParser as PMMarkdownParser,
  ParseSpec,
} from "prosemirror-markdown";

import { createTokenizer } from "./tokenizer";

/**
 * 检查节点类型是否存在于 schema 中。
 */
function hasNode(schema: Schema, name: string): boolean {
  return !!schema.nodes[name];
}

/**
 * 检查标记类型是否存在于 schema 中。
 */
function hasMark(schema: Schema, name: string): boolean {
  return !!schema.marks[name];
}

/**
 * 动态加载 prosemirror-markdown。
 * @returns prosemirror-markdown 运行时模块
 * @throws 当 prosemirror-markdown 加载失败时抛出错误
 */
/* eslint-disable @typescript-eslint/consistent-type-imports */
async function loadMarkdownParser(): Promise<
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
 * 添加基本块节点 Token 映射。
 * Add basic block node token mappings.
 *
 * @param schema - 当前 Tiptap Schema
 * @param tokens - 现有 Token 映射对象
 */
function addBasicBlockTokens(
  schema: Schema,
  tokens: Record<string, ParseSpec>,
): void {
  if (hasNode(schema, "heading")) {
    tokens.heading = {
      block: "heading",
      getAttrs: (token): Record<string, unknown> => ({
        level: Number(token.tag.slice(1)),
      }),
    };
  }

  if (hasNode(schema, "paragraph")) {
    tokens.paragraph = { block: "paragraph" };
  }
}

/**
 * 添加列表节点 Token 映射。
 * Add list node token mappings.
 *
 * @param schema - 当前 Tiptap Schema
 * @param tokens - 现有 Token 映射对象
 */
function addListBlockTokens(
  schema: Schema,
  tokens: Record<string, ParseSpec>,
): void {
  if (hasNode(schema, "bulletList")) {
    tokens.bullet_list = { block: "bulletList" };
  }

  if (hasNode(schema, "orderedList")) {
    tokens.ordered_list = {
      block: "orderedList",
      getAttrs: (token): Record<string, unknown> => ({
        start: Number(token.attrGet("start") ?? 1),
      }),
    };
  }

  if (hasNode(schema, "listItem")) {
    tokens.list_item = { block: "listItem" };
  }

  if (hasNode(schema, "blockquote")) {
    tokens.blockquote = { block: "blockquote" };
  }
}

/**
 * 添加代码块节点 Token 映射。
 * Add code block node token mappings.
 *
 * @param schema - 当前 Tiptap Schema
 * @param tokens - 现有 Token 映射对象
 */
function addCodeBlockTokens(
  schema: Schema,
  tokens: Record<string, ParseSpec>,
): void {
  if (!hasNode(schema, "codeBlock")) return;

  tokens.fence = {
    block: "codeBlock",
    noCloseToken: true,
    getAttrs: (token): Record<string, unknown> => ({
      language: token.info || null,
    }),
  };

  tokens.code_block = {
    block: "codeBlock",
    noCloseToken: true,
    getAttrs: (): Record<string, unknown> => ({ language: null }),
  };
}

/**
 * 添加表格节点 Token 映射。
 * Add table node token mappings.
 *
 * @param schema - 当前 Tiptap Schema
 * @param tokens - 现有 Token 映射对象
 */
function addTableBlockTokens(
  schema: Schema,
  tokens: Record<string, ParseSpec>,
): void {
  if (hasNode(schema, "table")) {
    tokens.table = { block: "table" };
  }

  if (hasNode(schema, "tableRow")) {
    tokens.tr = { block: "tableRow" };
  }

  if (hasNode(schema, "tableHeader")) {
    tokens.th = {
      block: "tableHeader",
      getAttrs: (token): Record<string, unknown> => ({
        colspan: Number(token.attrGet("colspan") ?? 1),
        rowspan: Number(token.attrGet("rowspan") ?? 1),
      }),
    };
  }

  if (hasNode(schema, "tableCell")) {
    tokens.td = {
      block: "tableCell",
      getAttrs: (token): Record<string, unknown> => ({
        colspan: Number(token.attrGet("colspan") ?? 1),
        rowspan: Number(token.attrGet("rowspan") ?? 1),
      }),
    };
  }
}

/**
 * 添加杂项块节点 Token 映射。
 * Add misc block node token mappings.
 *
 * @param schema - 当前 Tiptap Schema
 * @param tokens - 现有 Token 映射对象
 */
function addMiscBlockTokens(
  schema: Schema,
  tokens: Record<string, ParseSpec>,
): void {
  if (hasNode(schema, "lineBreak")) {
    tokens.hardbreak = { node: "lineBreak" };
  }

  if (hasNode(schema, "divider")) {
    tokens.hr = { node: "divider" };
  }
}

/**
 * 构建块级 Token 映射。
 * Build block-level token mappings.
 *
 * @param schema - 当前 Tiptap Schema
 * @returns 块级 Token 映射
 */
function buildBlockTokens(schema: Schema): Record<string, ParseSpec> {
  const tokens: Record<string, ParseSpec> = {};

  addBasicBlockTokens(schema, tokens);
  addListBlockTokens(schema, tokens);
  addCodeBlockTokens(schema, tokens);
  addTableBlockTokens(schema, tokens);
  addMiscBlockTokens(schema, tokens);

  return tokens;
}

/**
 * 构建内联标记 Token 映射。
 * Build inline mark token mappings.
 *
 * @param schema - 当前 Tiptap Schema
 * @returns 内联标记 Token 映射
 */
function buildInlineTokens(schema: Schema): Record<string, ParseSpec> {
  return {
    ...(hasMark(schema, "bold") && { strong: { mark: "bold" } }),
    ...(hasMark(schema, "italic") && { em: { mark: "italic" } }),
    ...(hasMark(schema, "strike") && { s: { mark: "strike" } }),
    ...(hasMark(schema, "inlineCode") && {
      code_inline: { mark: "inlineCode", noCloseToken: true },
    }),
    ...(hasMark(schema, "link") && {
      link: {
        mark: "link",
        getAttrs: (token): Record<string, unknown> => ({
          href: token.attrGet("href") || "",
          title: token.attrGet("title") || null,
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        }),
      },
    }),
    ...(hasNode(schema, "image") && {
      image: {
        node: "image",
        getAttrs: (token): Record<string, unknown> => ({
          src: token.attrGet("src") || "",
          alt: token.attrGet("alt") || "",
          title: token.attrGet("title") || "",
          type: "image",
          width: "150px",
          height: "auto",
        }),
      },
    }),
  };
}

/**
 * 创建 Markdown 解析器。
 * 将 Markdown-it Token 转换为当前 Tiptap Schema
 * 对应的 ProseMirror Node / Mark。
 *
 * @param schema - 当前 Tiptap Schema
 * @param extraTokens - 自定义 Token 映射
 * @returns Markdown Parser
 */
export async function createMarkdownParser(
  schema: Schema,
  extraTokens: Record<string, ParseSpec> = {},
): Promise<PMMarkdownParser> {
  const { MarkdownParser } = await loadMarkdownParser();

  const tokens: Record<string, ParseSpec> = {
    ...buildBlockTokens(schema),
    ...buildInlineTokens(schema),
  };

  /**
   * 允许外部覆盖默认 Token 映射。
   */
  return new MarkdownParser(schema, await createTokenizer(), {
    ...tokens,
    ...extraTokens,
  });
}
