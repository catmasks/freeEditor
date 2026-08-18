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
  /* eslint-enable @typescript-eslint/consistent-type-imports */
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
    /**
     * 标题
     */
    ...(hasNode(schema, "heading") && {
      heading: {
        block: "heading",

        getAttrs: (token) => ({
          level: Number(token.tag.slice(1)),
        }),
      },
    }),

    /**
     * 段落
     */
    ...(hasNode(schema, "paragraph") && {
      paragraph: {
        block: "paragraph",
      },
    }),

    /**
     * 无序列表
     */
    ...(hasNode(schema, "bulletList") && {
      bullet_list: {
        block: "bulletList",
      },
    }),

    /**
     * 有序列表
     */
    ...(hasNode(schema, "orderedList") && {
      ordered_list: {
        block: "orderedList",

        getAttrs: (token) => ({
          start: Number(token.attrGet("start") ?? 1),
        }),
      },
    }),

    /**
     * 列表项
     */
    ...(hasNode(schema, "listItem") && {
      list_item: {
        block: "listItem",
      },
    }),

    /**
     * 引用
     */
    ...(hasNode(schema, "blockquote") && {
      blockquote: {
        block: "blockquote",
      },
    }),

    /**
     * 代码块
     */
    ...(hasNode(schema, "codeBlock") && {
      fence: {
        block: "codeBlock",

        noCloseToken: true,

        getAttrs: (token) => ({
          language: token.info || null,
        }),
      },

      code_block: {
        block: "codeBlock",

        noCloseToken: true,

        getAttrs: () => ({
          language: null,
        }),
      },
    }),

    /**
     * Table
     */
    ...(hasNode(schema, "table") && {
      table: {
        block: "table",
      },
    }),

    ...(hasNode(schema, "tableRow") && {
      tr: {
        block: "tableRow",
      },
    }),

    ...(hasNode(schema, "tableHeader") && {
      th: {
        block: "tableHeader",

        getAttrs: (token) => ({
          colspan: Number(token.attrGet("colspan") ?? 1),
          rowspan: Number(token.attrGet("rowspan") ?? 1),
        }),
      },
    }),

    ...(hasNode(schema, "tableCell") && {
      td: {
        block: "tableCell",

        getAttrs: (token) => ({
          colspan: Number(token.attrGet("colspan") ?? 1),
          rowspan: Number(token.attrGet("rowspan") ?? 1),
        }),
      },
    }),

    /**
     * 硬换行
     */
    ...(hasNode(schema, "lineBreak") && {
      hardbreak: {
        node: "lineBreak",
      },
    }),

    /**
     * 分割线
     */
    ...(hasNode(schema, "divider") && {
      hr: {
        node: "divider",
      },
    }),

    /**
     * 粗体
     */
    ...(hasMark(schema, "bold") && {
      strong: {
        mark: "bold",
      },
    }),

    /**
     * 斜体
     */
    ...(hasMark(schema, "italic") && {
      em: {
        mark: "italic",
      },
    }),

    /**
     * 删除线
     */
    ...(hasMark(schema, "strike") && {
      s: {
        mark: "strike",
      },
    }),

    /**
     * 行内代码
     */
    ...(hasMark(schema, "inlineCode") && {
      code_inline: {
        mark: "inlineCode",
        noCloseToken: true,
      },
    }),

    /**
     * 链接
     */
    ...(hasMark(schema, "link") && {
      link: {
        mark: "link",

        getAttrs: (token) => ({
          href: token.attrGet("href") || "",
          title: token.attrGet("title") || null,
          target: "_blank",
          rel: "noopener noreferrer nofollow",
        }),
      },
    }),

    /**
     * 图片
     */
    ...(hasNode(schema, "image") && {
      image: {
        node: "image",

        getAttrs: (token) => ({
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

  /**
   * 允许外部覆盖默认 Token 映射。
   */
  return new MarkdownParser(schema, await createTokenizer(), {
    ...tokens,
    ...extraTokens,
  });
}
