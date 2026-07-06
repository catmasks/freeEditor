import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 代码块节点 / Code block node
 */
export const CustomCodeBlock = Node.create({
  name: "codeBlock",

  group: "block",

  content: "text*",

  marks: "",

  code: true,

  defining: true,

  isolating: true,

  /**
   * 默认选项 / Default options
   *
   * @returns 默认选项对象 / Default options object
   */
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  /**
   * 节点属性 / Node attributes
   *
   * @returns 属性定义对象 / Attribute definition object
   */
  addAttributes() {
    return {
      /**
       * 编程语言 / Programming language
       */
      language: {
        default: null,

        /**
         * 解析 HTML 属性 / Parse HTML attribute
         *
         * @param element HTML 元素 / HTML element
         * @returns 语言名称或 null / Language name or null
         */
        parseHTML: (element) => {
          return element.getAttribute("data-language") || null;
        },

        /**
         * 渲染 HTML 属性 / Render HTML attribute
         *
         * @param attrs 节点属性 / Node attributes
         * @returns HTML 属性对象 / HTML attributes object
         */
        renderHTML: (attrs) => {
          if (!attrs.language) {
            return {};
          }

          return {
            "data-language": attrs.language,
          };
        },
      },
    };
  },

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "pre",
      },
    ];
  },

  /**
   * 渲染 HTML / Render HTML
   *
   * @param HTMLAttributes HTML 属性 / HTML attributes
   * @returns HTML 渲染描述 / HTML render description
   */
  renderHTML({ HTMLAttributes }) {
    return [
      "pre",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ["code", {}, 0],
    ];
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Tab 键缩进 / Tab key indentation
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      Tab: ({ editor }) => {
        if (!editor.isActive(this.name)) {
          return false;
        }

        return editor.commands.insertContent("  ");
      },

      /**
       * Backspace 空代码块退出 / Backspace to exit empty code block
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      Backspace: ({ editor }) => {
        const { state } = editor;

        const { selection } = state;

        const { empty, $from } = selection;

        if (!empty) {
          return false;
        }

        if ($from.parent.type.name !== this.name) {
          return false;
        }

        if ($from.parent.textContent.length > 0) {
          return false;
        }

        return editor.chain().focus().clearNodes().run();
      },
    };
  },

  /**
   * 命令集合 / Command collection
   *
   * @returns 命令对象 / Command object
   */
  addCommands() {
    return {
      /**
       * 设置代码块 / Set code block
       *
       * 已是代码块时自动取消 / Automatically toggles off when already a code block
       *
       * @param language 编程语言 / Programming language
       * @returns 命令函数 / Command function
       */
      setCodeBlock:
        (language?: string | null) =>
        ({ commands, editor }) => {
          const isActive = editor.isActive(this.name);

          if (isActive) {
            return commands.clearNodes();
          }

          return commands.setNode(this.name, {
            language,
          });
        },

      /**
       * 清除代码块 / Unset code block
       *
       * @returns 命令函数 / Command function
       */
      unsetCodeBlock:
        () =>
        ({ commands }) => {
          return commands.clearNodes();
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    codeBlock: {
      /**
       * 设置代码块 / Set code block
       *
       * 已是代码块时自动取消 / Automatically toggles off when already a code block
       *
       * @param language 编程语言 / Programming language
       * @returns 返回值类型 / Return type
       */
      setCodeBlock: (language?: string | null) => ReturnType;

      /**
       * 清除代码块 / Unset code block
       *
       * @returns 返回值类型 / Return type
       */
      unsetCodeBlock: () => ReturnType;
    };
  }
}
