import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import type { MarkdownParser, MarkdownSerializer } from "prosemirror-markdown";

import { createMarkdownParser } from "./MarkdownParser";
import { createMarkdownSerializer } from "./MarkdownSerializer";
import { createMarkdownPastePlugin } from "./MarkdownPaste";
import { createMarkdownInputRules } from "./MarkdownInputRules";

import type {
  MarkdownOptions,
  MarkdownStorage,
  MarkdownNodeSerializer,
  MarkdownMarkSerializer,
} from "./types";

/** 为编辑器提供 Markdown 导入/导出功能 */
export const Markdown = Extension.create<MarkdownOptions, MarkdownStorage>({
  name: "markdown",

  addOptions() {
    return {
      parser: { tokens: {} },
      serializer: { nodes: {}, marks: {}, tightLists: false },
    };
  },

  addStorage() {
    return {
      parser: null as unknown as MarkdownParser,
      serializer: null as unknown as MarkdownSerializer,
      getMarkdown: () => "",
      registerNodeSerializer: (
        _name: string,
        _serializer: MarkdownNodeSerializer,
      ) => {},
      registerMarkSerializer: (
        _name: string,
        _serializer: MarkdownMarkSerializer,
      ) => {},
    };
  },

  onCreate() {
    const { editor } = this;
    const schema = editor.schema;
    const parser = createMarkdownParser(schema, this.options.parser?.tokens);
    const serializer = createMarkdownSerializer(
      schema,
      this.options.serializer?.nodes,
      this.options.serializer?.marks,
    );
    const storage = (editor.storage as any).markdown as MarkdownStorage;

    storage.parser = parser;
    storage.serializer = serializer;

    storage.getMarkdown = () => {
      return serializer.serialize(editor.state.doc, {
        tightLists: this.options.serializer?.tightLists ?? false,
      });
    };

    storage.registerNodeSerializer = (
      name: string,
      nodeSerializer: MarkdownNodeSerializer,
    ) => {
      const nodes = {
        ...this.options.serializer?.nodes,
        [name]: nodeSerializer,
      };
      storage.serializer = createMarkdownSerializer(schema, nodes, {});
    };

    storage.registerMarkSerializer = (
      name: string,
      markSerializer: MarkdownMarkSerializer,
    ) => {
      const marks = {
        ...this.options.serializer?.marks,
        [name]: markSerializer,
      };
      storage.serializer = createMarkdownSerializer(schema, {}, marks);
    };
  },

  addCommands() {
    return {
      setMarkdown:
        (markdown: string) =>
        ({ editor }: { editor: Editor }) => {
          try {
            const parser = ((editor.storage as any).markdown as MarkdownStorage)
              .parser;
            if (!parser) {
              console.warn("[Markdown] Parser not initialized yet");
              return false;
            }
            editor.commands.setContent(parser.parse(markdown).toJSON());
            return true;
          } catch (error) {
            console.error("[Markdown] Failed to parse markdown:", error);
            return false;
          }
        },
    };
  },

  addProseMirrorPlugins() {
    const { editor } = this;
    const getParser = () =>
      ((editor.storage as any).markdown as MarkdownStorage).parser || null;
    return [createMarkdownPastePlugin(editor, getParser)];
  },

  addInputRules() {
    return createMarkdownInputRules(this.editor.schema);
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    markdown: {
      /** 设置 Markdown 内容 */
      setMarkdown: (markdown: string) => ReturnType;
    };
  }
}
