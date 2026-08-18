import type { MarkdownParser } from "prosemirror-markdown";
import type { MarkdownSerializer } from "prosemirror-markdown";

/** Markdown 扩展选项 */
export interface MarkdownOptions {
  /** 解析器额外配置 */
  parser?: {
    /** 自定义 token 映射，覆盖或扩展默认的 markdown-it token 到 ProseMirror 的映射 */
    tokens?: Record<string, any>;
  };

  /** 序列化器额外配置 */
  serializer?: {
    /** 自定义节点序列化器 */
    nodes?: Record<string, MarkdownNodeSerializer>;
    /** 自定义标记序列化器 */
    marks?: Record<string, MarkdownMarkSerializer>;
    /** 是否紧凑列表（无空行间隔），默认 false */
    tightLists?: boolean;
  };
}

/** Markdown 节点序列化器 */
export interface MarkdownNodeSerializer {
  /** @param node 当前节点  @param state 序列化器状态  @param parent 父节点  @param index 子节点索引 */
  serialize: (
    node: unknown,
    state: unknown,
    parent: unknown,
    index: number,
  ) => void;
}

/** Markdown 标记序列化器 */
export interface MarkdownMarkSerializer {
  open: string | ((state: unknown, mark: unknown) => string);
  close: string | ((state: unknown, mark: unknown) => string);
  mixable?: boolean;
  expelEnclosingWhitespace?: boolean;
}

/** Markdown 存储 */
export interface MarkdownStorage {
  parser: MarkdownParser;
  serializer: MarkdownSerializer;
  /** 获取当前编辑器内容的 Markdown 字符串 */
  getMarkdown: () => string;
  /** 注册自定义节点序列化器 */
  registerNodeSerializer: (
    name: string,
    serializer: MarkdownNodeSerializer,
  ) => Promise<void>;
  /** 注册自定义标记序列化器 */
  registerMarkSerializer: (
    name: string,
    serializer: MarkdownMarkSerializer,
  ) => Promise<void>;
}

/** Markdown 解析结果 */
export interface MarkdownParseResult {
  json: Record<string, unknown>;
  success: boolean;
  error?: string;
}
