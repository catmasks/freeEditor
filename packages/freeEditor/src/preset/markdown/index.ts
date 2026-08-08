import type { EditorPlugin } from "../../core";
import { Markdown } from "./Markdown";

/**
 * Markdown 插件 / Markdown plugin
 *
 * 支持 Markdown 语法快捷输入、粘贴转换、HTML 序列化
 * Supports Markdown syntax shortcut input, paste conversion, HTML serialization
 */
export const MarkdownPlugin: EditorPlugin = {
  key: "markdown",
  extensions: [Markdown],
};