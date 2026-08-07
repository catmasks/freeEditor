export { Markdown } from "./Markdown";

export { createMarkdownParser } from "./MarkdownParser";
export { createMarkdownSerializer } from "./MarkdownSerializer";
export { createMarkdownPastePlugin, isMarkdown } from "./MarkdownPaste";
export { createMarkdownInputRules } from "./MarkdownInputRules";

export type { MarkdownOptions, MarkdownStorage, MarkdownNodeSerializer, MarkdownMarkSerializer, MarkdownParseResult } from "./types";

import type { EditorPlugin } from "../../core";
import { Markdown } from "./Markdown";

export const MarkdownPlugin: EditorPlugin = {
  key: "markdown",
  extensions: [Markdown],
};