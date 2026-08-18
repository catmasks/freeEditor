import type MarkdownIt from "markdown-it";

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
function createParagraphOpenToken(sourceToken: any): Record<string, any> {
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
function createParagraphCloseToken(sourceToken: any): Record<string, any> {
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
function createTokenizerInstance(
  MarkdownItClass: typeof MarkdownIt,
): MarkdownIt {
  const markdown = new MarkdownItClass({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
  });

  const originalParse = markdown.parse.bind(markdown);

  /**
   * 覆写 parse 方法
   */
  markdown.parse = (...args: [string, any[]]): any[] => {
    const tokens = originalParse(...args);

    return normalizeTableTokens(tokens as any[]);
  };

  return markdown;
}

/**
 * 动态加载 Markdown-it。
 * 避免编辑器初始化时直接加载 markdown-it。
 */
export async function createTokenizer(): Promise<MarkdownIt> {
  try {
    const module = await import("markdown-it");

    /**
     * 兼容 ESM / CommonJS 两种模块导出形式。
     */
    const MarkdownItClass = module.default;

    if (!MarkdownItClass) {
      throw new Error("markdown-it 模块加载成功，但未找到默认导出。");
    }

    return createTokenizerInstance(MarkdownItClass);
  } catch (error) {
    console.error("[Markdown] markdown-it 加载失败:", error);

    throw new Error("Markdown 功能初始化失败：无法加载 markdown-it。", {
      cause: error,
    });
  }
}
