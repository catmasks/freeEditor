import MarkdownIt from "markdown-it";

/**
 * 判断一个 token 是不是表格单元格（th/td）的开始标签。
 */
function isTableCellOpenToken(token: any): boolean {
  return token.type === "th_open" || token.type === "td_open";
}

/**
 * 判断一个 token 是不是表格单元格（th/td）的结束标签。
 */
function isTableCellCloseToken(token: any): boolean {
  return token.type === "th_close" || token.type === "td_close";
}

/**
 * 创建一个表示段落开始的 token。
 */
function createParagraphOpenToken(sourceToken: any): any {
  return {
    ...sourceToken,

    type: "paragraph_open",
    tag: "p",
    nesting: 1,
    level: sourceToken.level + 1,
    attrs: null,
    map: null,
    markup: "",
    info: "",
    meta: null,
    block: true,
    hidden: false,
    content: "",
    children: null,
  };
}

/**
 * 创建一个表示段落结束的 token，与上面的开始标签配对。
 */
function createParagraphCloseToken(sourceToken: any): any {
  return {
    ...sourceToken,

    type: "paragraph_close",
    tag: "p",
    nesting: -1,
    level: sourceToken.level + 1,
    attrs: null,
    map: null,
    markup: "",
    info: "",
    meta: null,
    block: true,
    hidden: false,
    content: "",
    children: null,
  };
}

/**
 * 对表格的 token 流进行结构调整。
 */
function normalizeTableTokens(tokens: any[]): any[] {
  const result: any[] = [];

  for (const token of tokens) {
    /**
     * 去掉 thead 和 tbody 相关标签
     */
    if (
      token.type === "thead_open" ||
      token.type === "thead_close" ||
      token.type === "tbody_open" ||
      token.type === "tbody_close"
    ) {
      continue;
    }

    /**
     * 单元格开始标签（th_open / td_open）
     */
    if (isTableCellOpenToken(token)) {
      result.push(token);
      result.push(createParagraphOpenToken(token));
      continue;
    }

    /**
     * 单元格结束标签（th_close / td_close）
     */
    if (isTableCellCloseToken(token)) {
      result.push(createParagraphCloseToken(token));
      result.push(token);
      continue;
    }

    /**
     * 其他标签原样保留
     */
    result.push(token);
  }

  return result;
}

/**
 * 创建一个专门用来解析 Markdown 的 tokenizer。
 *
 * - HTML 标签
 * - GFM 表格
 * - 自动识别链接
 * - 排版优化（如智能引号）
 * - CommonMark 标准
 */
export function createTokenizer(): MarkdownIt {
  const markdown = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
  });

  const originalParse = markdown.parse.bind(markdown);

  /**
   * 覆写 parse 方法
   */
  markdown.parse = (...args) => {
    const tokens = originalParse(...args);
    return normalizeTableTokens(tokens);
  };

  return markdown;
}

export const defaultTokenizer = createTokenizer();
