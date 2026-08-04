import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 引用节点 / Blockquote node
 */
export const Blockquote = Node.create({
  name: "blockquote",

  group: "block",

  content: "block+",

  defining: true,

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
        tag: "blockquote",
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
      "blockquote",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
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
       * 设置引用 / Wrap in blockquote
       *
       * @returns 命令函数 / Command function
       */
      setBlockquote:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },

      /**
       * 取消引用 / Unwrap from blockquote
       *
       * @returns 命令函数 / Command function
       */
      unsetBlockquote:
        () =>
        ({ commands }) => {
          return commands.lift(this.name);
        },

      /**
       * 切换引用 / Toggle blockquote
       *
       * 已是引用时自动取消 / Automatically toggles off when already a blockquote
       *
       * @returns 命令函数 / Command function
       */
      toggleBlockquote:
        () =>
        ({ chain, editor }) => {
          const isActive = editor.isActive(this.name);
          if (isActive) {
            return chain().focus().lift(this.name).run();
          }
          return chain().focus().wrapIn(this.name).run();
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
       * Ctrl/Cmd + Shift + B 切换引用 / Ctrl/Cmd + Shift + B toggle blockquote
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-Shift-b": () => {
        return this.editor.commands.toggleBlockquote();
      },
    };
  },
});

/**
 * 引用 schema 扩展 / Blockquote schema extension
 *
 * 仅保留 node schema，命令和快捷键由 Blockquote feature 扩展注册。
 */
export const BlockquoteSchema = Blockquote.extend({
  addKeyboardShortcuts() {
    return {};
  },

  addCommands() {
    return {};
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blockquote: {
      /**
       * 设置引用 / Wrap in blockquote
       *
       * @returns 返回值类型 / Return type
       */
      setBlockquote: () => ReturnType;

      /**
       * 取消引用 / Unwrap from blockquote
       *
       * @returns 返回值类型 / Return type
       */
      unsetBlockquote: () => ReturnType;

      /**
       * 切换引用 / Toggle blockquote
       *
       * 已是引用时自动取消 / Automatically toggles off when already a blockquote
       *
       * @returns 返回值类型 / Return type
       */
      toggleBlockquote: () => ReturnType;
    };
  }
}
