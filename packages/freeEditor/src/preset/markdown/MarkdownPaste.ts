import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/core";
import type { MarkdownParser } from "prosemirror-markdown";

/** 判断文本是否为 Markdown，通过检查常见 Markdown 语法特征 */
export function isMarkdown(text: string): boolean {
  if (!text || typeof text !== "string") return false;

  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^#{1,6}\s/.test(trimmed)) return true;
    if (/\*\*[^*]+\*\*/.test(trimmed) || /__[^_]+__/.test(trimmed)) return true;
    if (/\*[^*\s][^*]*\*/.test(trimmed) || /_[^_\s][^_]*_/.test(trimmed)) return true;
    if (/^[-*+]\s/.test(trimmed)) return true;
    if (/^\d+\.\s/.test(trimmed)) return true;
    if (/^>\s/.test(trimmed)) return true;
    if (/^```/.test(trimmed)) return true;
    if (/`[^`]+`/.test(trimmed)) return true;
    if (/\[.*\]\(.*\)/.test(trimmed)) return true;
    if (/!\[.*\]\(.*\)/.test(trimmed)) return true;
    if (/~~[^~]+~~/.test(trimmed)) return true;
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(trimmed)) return true;
  }
  return false;
}

/**
 * 创建 Markdown 粘贴插件。
 * 监听粘贴事件，当粘贴内容为 Markdown 时阻止默认粘贴并解析插入。
 * 使用延迟获取 parser，因为 parser 在 onCreate 之后才初始化。
 */
export function createMarkdownPastePlugin(
  editor: Editor,
  getParser: () => MarkdownParser | null,
): Plugin {
  return new Plugin({
    key: new PluginKey("markdown-paste"),
    props: {
      handlePaste: (view, event: ClipboardEvent) => {
        const parser = getParser();
        if (!parser) return false;

        const text = event.clipboardData?.getData("text/plain");
        if (!text) return false;
        if (!isMarkdown(text)) return false;

        event.preventDefault();
        try {
          editor.commands.setContent(parser.parse(text).toJSON());
        } catch (error) {
          console.warn("[MarkdownPaste] Failed to parse markdown:", error);
          return false;
        }
        return true;
      },
    },
  });
}