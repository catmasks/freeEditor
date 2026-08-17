import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/core";
import type { MarkdownParser } from "prosemirror-markdown";

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

    /** ATX 标题 */
    if (/^#{1,6}\s+/.test(trimmed)) {
      return true;
    }

    /** Setext 标题 */
    if (/^=+\s*$/.test(trimmed) || /^-+\s*$/.test(trimmed)) {
      return true;
    }

    /** 粗体 */
    if (/\*\*[^*]+\*\*/.test(trimmed) || /__[^_]+__/.test(trimmed)) {
      return true;
    }

    /** 斜体 */
    if (/\*[^*\s][^*]*\*/.test(trimmed) || /_[^_\s][^_]*_/.test(trimmed)) {
      return true;
    }

    /** 无序列表 */
    if (/^[-*+]\s+/.test(trimmed)) {
      return true;
    }

    /** 有序列表 */
    if (/^\d+\.\s+/.test(trimmed)) {
      return true;
    }

    /** 引用 */
    if (/^>\s?/.test(trimmed)) {
      return true;
    }

    /** Fenced Code Block */
    if (/^(?:`{3,}|~{3,})/.test(trimmed)) {
      return true;
    }

    /** 行内代码 */
    if (/`[^`]+`/.test(trimmed)) {
      return true;
    }

    /** Markdown 链接 */
    if (/\[[^\]]+\]\([^)]+\)/.test(trimmed)) {
      return true;
    }

    /** Markdown 图片 */
    if (/!\[[^\]]*\]\([^)]+\)/.test(trimmed)) {
      return true;
    }

    /** 删除线 */
    if (/~~[^~]+~~/.test(trimmed)) {
      return true;
    }

    /** Markdown 表格 */
    if (/^\|.*\|$/.test(trimmed)) {
      return true;
    }

    /** Markdown 表格分隔行 */
    if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed)) {
      return true;
    }

    /** 分割线 */
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(trimmed)) {
      return true;
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
 * 将单独的 HTML 片段转换为 Markdown。
 */
function htmlToMarkdown(html: string): string {
  if (!html || !hasHtml(html)) {
    return html;
  }

  const container = document.createElement("div");

  container.innerHTML = html;

  /**
   * 递归转换 DOM Node。
   */
  const convertNode = (node: Node): string => {
    /**
     * 文本节点。
     */
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? "";
    }

    /**
     * 非元素节点。
     */
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return "";
    }

    const element = node as HTMLElement;
    const tag = element.tagName.toLowerCase();

    const children = Array.from(element.childNodes).map(convertNode).join("");

    switch (tag) {
      /**
       * 标题
       */
      case "h1":
        return `# ${children.trim()}\n\n`;

      case "h2":
        return `## ${children.trim()}\n\n`;

      case "h3":
        return `### ${children.trim()}\n\n`;

      case "h4":
        return `#### ${children.trim()}\n\n`;

      case "h5":
        return `##### ${children.trim()}\n\n`;

      case "h6":
        return `###### ${children.trim()}\n\n`;

      /**
       * 段落
       */
      case "p":
        return `${children.trim()}\n\n`;

      /**
       * 换行
       */
      case "br":
        return "\n";

      /**
       * 粗体
       */
      case "strong":
      case "b":
        return `**${children.trim()}**`;

      /**
       * 斜体
       */
      case "em":
      case "i":
        return `*${children.trim()}*`;

      /**
       * 删除线
       */
      case "s":
      case "del":
        return `~~${children.trim()}~~`;

      /**
       * 链接
       */
      case "a": {
        const href = element.getAttribute("href");

        if (!href) {
          return children;
        }

        const title = element.getAttribute("title");

        if (title) {
          return `[${children.trim()}](${href} "${title}")`;
        }

        return `[${children.trim()}](${href})`;
      }

      /**
       * 图片
       */
      case "img": {
        const src = element.getAttribute("src");

        if (!src) {
          return "";
        }

        const alt = element.getAttribute("alt") ?? "";
        const title = element.getAttribute("title");

        if (title) {
          return `![${alt}](${src} "${title}")`;
        }

        return `![${alt}](${src})`;
      }

      /**
       * 分割线
       */
      case "hr":
        return "\n---\n\n";

      /**
       * 块级容器
       */
      case "div":
      case "section":
      case "article":
      case "header":
      case "footer":
      case "main":
      case "center":
        return `${children}\n`;

      /**
       * 行内容器
       */
      case "span":
      case "small":
      case "label":
        return children;

      /**
       * 行内 code
       */
      case "code":
        return `\`${children}\``;

      /**
       * 未知 HTML
       */
      default:
        return children;
    }
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
  const flushNormalBuffer = () => {
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
      handlePaste: (view, event: ClipboardEvent) => {
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
