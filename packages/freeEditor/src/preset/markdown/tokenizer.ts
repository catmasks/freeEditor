import MarkdownIt from "markdown-it";

/** 创建 markdown-it 实例 */
export function createTokenizer(): MarkdownIt {
  return new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false,
  });
}

/** 默认 tokenizer 实例 */
export const defaultTokenizer = createTokenizer();