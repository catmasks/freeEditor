import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 分割线节点 / Divider (horizontal rule) node
 *
 * 在文档中插入一条水平分割线，用于分隔内容区块。
 * 渲染为 HTML 的 &lt;hr&gt; 标签。
 *
 * Inserts a horizontal rule in the document to separate content sections.
 * Renders as the HTML &lt;hr&gt; tag.
 */
export const Divider = Node.create({
  name: "divider",

  group: "block",

  /** 原子节点：无子内容 / Atom node: no child content */
  atom: true,

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
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "hr",
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
      "hr",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  /**
   * 命令集合 / Command collection
   *
   * @returns 命令对象 / Command object
   */
  addCommands() {
    return {
      /**
       * 插入分割线 / Insert divider
       *
       * 在光标位置插入一条水平分割线，并将光标移动到分割线下方的新段落。
       *
       * Inserts a horizontal rule at the cursor position and moves the cursor
       * to a new paragraph below the divider.
       *
       * @returns 命令函数 / Command function
       */
      setDivider:
        () =>
        ({ chain }) => {
          return chain()
            .insertContent([
              {
                type: this.name,
              },
              {
                type: "paragraph",
                content: [],
              },
            ])
            .run();
        },
    };
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Ctrl/Cmd + Shift + H 插入分割线 / Ctrl/Cmd + Shift + H insert divider
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-Shift-h": () => {
        return this.editor.commands.setDivider();
      },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    divider: {
      /**
       * 插入分割线 / Insert divider
       *
       * 在光标位置插入一条水平分割线，并将光标移动到分割线下方的新段落。
       *
       * Inserts a horizontal rule at the cursor position and moves the cursor
       * to a new paragraph below the divider.
       *
       * @returns 返回值类型 / Return type
       */
      setDivider: () => ReturnType;
    };
  }
}
