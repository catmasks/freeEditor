import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/core";
import type { MarkdownParser } from "prosemirror-markdown";

/**
 * Markdown 语法检测器列表。
 * List of Markdown syntax detectors.
 * 每个检测器接收一行文本，返回是否匹配。
 * Each detector takes a line of text and returns whether it matches.
 */
type MarkdownDetector = (line: string) => boolean;

/** ATX 标题检测器 / ATX heading detector */
const atxHeading: MarkdownDetector = (line) => /^#{1,6}\s+/.test(line);

/** Setext 标题检测器 / Setext heading detector */
const setextHeading: MarkdownDetector = (line) =>
  /^=+\s*$/.test(line) || /^-+\s*$/.test(line);

/** 粗体检测器 / Bold detector */
const boldText: MarkdownDetector = (line) =>
  /\*\*[^*]+\*\*/.test(line) || /__[^_]+__/.test(line);

/** 斜体检测器 / Italic detector */
const italicText: MarkdownDetector = (line) =>
  /\*[^*\s][^*]*\*/.test(line) || /_[^_\s][^_]*_/.test(line);

/** 无序列表检测器 / Unordered list detector */
const unorderedList: MarkdownDetector = (line) => /^[-*+]\s+/.test(line);

/** 有序列表检测器 / Ordered list detector */
const orderedList: MarkdownDetector = (line) => /^\d+\.\s+/.test(line);

/** 引用检测器 / Blockquote detector */
const blockquote: MarkdownDetector = (line) => /^>\s?/.test(line);

/** 围栏代码块检测器 / Fenced code block detector */
const fencedCodeBlock: MarkdownDetector = (line) =>
  /^(?:`{3,}|~{3,})/.test(line);

/** 行内代码检测器 / Inline code detector */
const inlineCode: MarkdownDetector = (line) => /`[^`]+`/.test(line);

/** 链接检测器 / Link detector */
const linkText: MarkdownDetector = (line) => /\[[^\]]+\]\([^)]+\)/.test(line);

/** 图片检测器 / Image detector */
const imageText: MarkdownDetector = (line) => /!\[[^\]]*\]\([^)]+\)/.test(line);

/** 删除线检测器 / Strikethrough detector */
const strikethrough: MarkdownDetector = (line) => /~~[^~]+~~/.test(line);

/** 表格检测器 / Table detector */
const tableRow: MarkdownDetector = (line) => /^\|.*\|$/.test(line);

/** 表格分隔行检测器 / Table separator detector */
const tableSeparator: MarkdownDetector = (line) =>
  /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line);

/** 分割线检测器 / Thematic break detector */
const thematicBreak: MarkdownDetector = (line) =>
  /^(-{3,}|\*{3,}|_{3,})\s*$/.test(line);

/** 所有 Markdown 检测器列表 / All Markdown detectors list */
const MARKDOWN_DETECTORS: MarkdownDetector[] = [
  atxHeading,
  setextHeading,
  boldText,
  italicText,
  unorderedList,
  orderedList,
  blockquote,
  fencedCodeBlock,
  inlineCode,
  linkText,
  imageText,
  strikethrough,
  tableRow,
  tableSeparator,
  thematicBreak,
];

/**
 * 判断文本是否包含明显的 Markdown 语法。
 */
export function isMarkdown(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false;
  }

  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    for (const detector of MARKDOWN_DETECTORS) {
      if (detector(trimmed)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 判断文本中是否存在 HTML。
 */
function hasHtml(text: string): boolean {
  return /<\/?[a-z][^>]*>/i.test(text);
}

/**
 * 判断是否为 fenced code block 开始行。
 *
 * 支持：
 *
 * ```
 * ```ts
 * ~~~
 * ~~~html
 *
 * 最多允许 3 个空格缩进。
 */
function parseFenceStart(line: string): {
  marker: "`" | "~";
  length: number;
} | null {
  const match = line.match(/^[ ]{0,3}(`{3,}|~{3,})(?:[^\r\n]*)$/);

  if (!match) {
    return null;
  }

  const fence = match[1];

  return {
    marker: fence[0] as "`" | "~",
    length: fence.length,
  };
}

/**
 * 判断是否为 fenced code block 结束行。
 */
function isFenceEnd(line: string, marker: "`" | "~", length: number): boolean {
  const escapedMarker = marker === "`" ? "`" : "~";

  const regex = new RegExp(`^[ ]{0,3}${escapedMarker}{${length},}[ \\t]*$`);

  return regex.test(line);
}

/**
 * 将 HTML 元素转换为 Markdown 字符串。
 * Convert HTML element to Markdown string.
 *
 * @param element - HTML 元素 / HTML element.
 * @param children - 子节点的 Markdown 字符串 / Markdown string of children.
 * @returns Markdown 字符串 / Markdown string.
 */
function convertHeadingToMarkdown(
  element: HTMLElement,
  children: string,
): string {
  const level = Number(element.tagName.slice(1));
  return `${"#".repeat(level)} ${children.trim()}\n\n`;
}

/**
 * 将段落元素转换为 Markdown。
 * Convert paragraph element to Markdown.
 *
 * @param children - 子节点的 Markdown 字符串 / Markdown string of children.
 * @returns Markdown 字符串 / Markdown string.
 */
function convertParagraphToMarkdown(children: string): string {
  return `${children.trim()}\n\n`;
}

/**
 * 将内联格式元素转换为 Markdown。
 * Convert inline formatting element to Markdown.
 *
 * @param tag - 标签名 / Tag name.
 * @param children - 子节点的 Markdown 字符串 / Markdown string of children.
 * @returns Markdown 字符串 / Markdown string.
 */
function convertInlineFormatToMarkdown(tag: string, children: string): string {
  if (tag === "strong" || tag === "b") return `**${children.trim()}**`;
  if (tag === "em" || tag === "i") return `*${children.trim()}*`;
  if (tag === "s" || tag === "del") return `~~${children.trim()}~~`;
  if (tag === "code") return `\`${children}\``;
  return children;
}

/**
 * 将链接元素转换为 Markdown。
 * Convert link element to Markdown.
 *
 * @param element - 链接元素 / Link element.
 * @param children - 子节点的 Markdown 字符串 / Markdown string of children.
 * @returns Markdown 字符串 / Markdown string.
 */
function convertLinkToMarkdown(element: HTMLElement, children: string): string {
  const href = element.getAttribute("href");
  if (!href) return children;

  const title = element.getAttribute("title");
  if (title) {
    return `[${children.trim()}](${href} "${title}")`;
  }
  return `[${children.trim()}](${href})`;
}

/**
 * 将图片元素转换为 Markdown。
 * Convert image element to Markdown.
 *
 * @param element - 图片元素 / Image element.
 * @returns Markdown 字符串 / Markdown string.
 */
function convertImageToMarkdown(element: HTMLElement): string {
  const src = element.getAttribute("src");
  if (!src) return "";

  const alt = element.getAttribute("alt") ?? "";
  const title = element.getAttribute("title");

  if (title) {
    return `![${alt}](${src} "${title}")`;
  }
  return `![${alt}](${src})`;
}

/**
 * 将块级容器元素转换为 Markdown。
 * Convert block-level container element to Markdown.
 *
 * @param children - 子节点的 Markdown 字符串 / Markdown string of children.
 * @returns Markdown 字符串 / Markdown string.
 */
function convertBlockContainerToMarkdown(children: string): string {
  return `${children}\n`;
}

/**
 * Node 转换器函数类型。
 * Node converter function type.
 */
type NodeConverter = (element: HTMLElement, children: string) => string;

/**
 * 获取节点转换器映射。
 * Get node converter map.
 */
function createNodeConverterMap(): Record<string, NodeConverter> {
  return {
    h1: (el, ch) => convertHeadingToMarkdown(el, ch),
    h2: (el, ch) => convertHeadingToMarkdown(el, ch),
    h3: (el, ch) => convertHeadingToMarkdown(el, ch),
    h4: (el, ch) => convertHeadingToMarkdown(el, ch),
    h5: (el, ch) => convertHeadingToMarkdown(el, ch),
    h6: (el, ch) => convertHeadingToMarkdown(el, ch),
    p: (_, ch) => convertParagraphToMarkdown(ch),
    br: () => "\n",
    strong: (_, ch) => convertInlineFormatToMarkdown("strong", ch),
    b: (_, ch) => convertInlineFormatToMarkdown("b", ch),
    em: (_, ch) => convertInlineFormatToMarkdown("em", ch),
    i: (_, ch) => convertInlineFormatToMarkdown("i", ch),
    s: (_, ch) => convertInlineFormatToMarkdown("s", ch),
    del: (_, ch) => convertInlineFormatToMarkdown("del", ch),
    code: (_, ch) => convertInlineFormatToMarkdown("code", ch),
    a: (el, ch) => convertLinkToMarkdown(el, ch),
    img: (el) => convertImageToMarkdown(el),
    hr: () => "\n---\n\n",
    div: (_, ch) => convertBlockContainerToMarkdown(ch),
    section: (_, ch) => convertBlockContainerToMarkdown(ch),
    article: (_, ch) => convertBlockContainerToMarkdown(ch),
    header: (_, ch) => convertBlockContainerToMarkdown(ch),
    footer: (_, ch) => convertBlockContainerToMarkdown(ch),
    main: (_, ch) => convertBlockContainerToMarkdown(ch),
    center: (_, ch) => convertBlockContainerToMarkdown(ch),
    span: (_, ch) => ch,
    small: (_, ch) => ch,
    label: (_, ch) => ch,
  };
}

/**
 * 将 HTML 片段转换为 Markdown。
 */
function htmlToMarkdown(html: string): string {
  if (!html || !hasHtml(html)) {
    return html;
  }

  const container = document.createElement("div");
  container.innerHTML = html;

  const nodeConverters = createNodeConverterMap();

  /**
   * 递归转换 DOM Node。
   */
  const convertNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? "";
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();
    const children = Array.from(element.childNodes).map(convertNode).join("");

    const converter = nodeConverters[tag];
    return converter ? converter(element, children) : children;
  };

  return Array.from(container.childNodes)
    .map(convertNode)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Markdown 预处理。
 */
function normalizeMarkdown(text: string): string {
  if (!text) {
    return text;
  }

  const lines = text.split(/\r?\n/);

  const result: string[] = [];

  /**
   * 当前是否处于 fenced code block。
   */
  let inCodeBlock = false;

  /**
   * 当前代码块的 fence。
   */
  let codeMarker: "`" | "~" | null = null;

  /**
   * 当前代码块 fence 长度。
   */
  let codeFenceLength = 0;

  /**
   * 普通 Markdown 缓冲区。
   */
  let normalBuffer: string[] = [];

  /**
   * 刷新普通 Markdown。
   */
  const flushNormalBuffer = (): void => {
    if (!normalBuffer.length) {
      return;
    }

    const content = normalBuffer.join("\n");

    if (content) {
      result.push(htmlToMarkdown(content));
    }

    normalBuffer = [];
  };

  for (const line of lines) {
    /**
     * 当前处于代码块
     */
    if (inCodeBlock) {
      /**
       * 判断当前行是不是关闭 fence。
       */
      if (codeMarker && isFenceEnd(line, codeMarker, codeFenceLength)) {
        /**
         * 保留关闭 fence。
         */
        result.push(line);

        /**
         * 退出代码块。
         */
        inCodeBlock = false;
        codeMarker = null;
        codeFenceLength = 0;

        continue;
      }

      /**
       * 代码块内部原样保留。
       */
      result.push(line);

      continue;
    }

    /**
     * 当前不在代码块。
     */

    const fence = parseFenceStart(line);

    /**
     * 遇到代码块开始。
     */
    if (fence) {
      /**
       * 先处理代码块之前的普通 Markdown。
       */
      flushNormalBuffer();

      /**
       * 保存代码块开始信息。
       */
      inCodeBlock = true;
      codeMarker = fence.marker;
      codeFenceLength = fence.length;

      /**
       * 原样保存开始 fence。
       */
      result.push(line);

      continue;
    }

    /**
     * 普通 Markdown 行。
     */
    normalBuffer.push(line);
  }

  /**
   * 处理剩余的普通 Markdown。
   */
  flushNormalBuffer();

  return result
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Markdown Parser 获取函数类型。
 */
type MarkdownParserGetter = () =>
  | MarkdownParser
  | Promise<MarkdownParser | null>
  | null;

/**
 * 创建 Markdown 粘贴插件。
 */
export function createMarkdownPastePlugin(
  editor: Editor,
  getParser: MarkdownParserGetter,
): Plugin {
  /**
   * 防止用户连续粘贴 Markdown 时重复加载 Parser。
   *
   * 第一次加载后，后续直接复用同一个 Promise。
   */
  let parserPromise: Promise<MarkdownParser | null> | null = null;

  /**
   * 获取 Markdown Parser。
   */
  const resolveParser = async (): Promise<MarkdownParser | null> => {
    if (!parserPromise) {
      parserPromise = Promise.resolve()
        .then(() => getParser())
        .catch((error) => {
          /**
           * Parser 加载失败后清空缓存，
           * 下次粘贴时允许重新尝试加载。
           */
          parserPromise = null;

          console.warn("[MarkdownPaste] Markdown parser 加载失败:", error);

          return null;
        });
    }

    return parserPromise;
  };

  return new Plugin({
    key: new PluginKey("markdown-paste"),

    props: {
      handlePaste: (view, event: ClipboardEvent): boolean => {
        /**
         * 获取纯文本。
         */
        const text = event.clipboardData?.getData("text/plain") ?? "";

        if (!text) {
          return false;
        }

        /**
         * 判断 Markdown。
         */
        if (!isMarkdown(text)) {
          return false;
        }

        /**
         * Markdown 粘贴异步加载依赖。
         */
        event.preventDefault();

        /**
         * Markdown 预处理。
         */
        const markdown = normalizeMarkdown(text);

        /**
         * 异步加载 Parser 并插入文档。
         */
        void resolveParser().then((parser) => {
          if (!parser) {
            console.warn("[MarkdownPaste] Markdown parser is not initialized.");

            return;
          }

          try {
            /**
             * Markdown → ProseMirror。
             */
            const doc = parser.parse(markdown);

            /**
             * 插入当前选区。
             */
            const slice = doc.slice(0, doc.content.size);

            const transaction = view.state.tr.replaceSelection(slice);

            view.dispatch(transaction);
          } catch (error) {
            /**
             * Markdown 解析失败。
             */

            console.warn("[MarkdownPaste] Failed to parse markdown:", error);
          }
        });

        /**
         * 已经阻止浏览器默认粘贴。
         */
        return true;
      },
    },
  });
}
