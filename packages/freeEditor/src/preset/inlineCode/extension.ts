import { Mark } from "@tiptap/core";

/**
 * 行内代码标记 / Inline code mark
 */
export const InlineCode = Mark.create({
  name: "inlineCode",

  priority: 1000,

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "code",
        /**
         * 排除代码块内的 code / Exclude code inside code blocks
         *
         * @param node DOM 节点 / DOM node
         * @returns 是否匹配 / Whether matches
         */
        getAttrs: (node) => {
          if (
            node instanceof HTMLElement &&
            node.parentElement?.tagName === "PRE"
          ) {
            return false;
          }

          return {};
        },
      },
    ];
  },

  /**
   * 渲染 HTML / Render HTML
   *
   * @returns HTML 渲染描述 / HTML render description
   */
  renderHTML() {
    return ["code", {}, 0];
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Ctrl/Cmd + E 切换行内代码 / Ctrl/Cmd + E toggle inline code
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-e": () => {
        return this.editor.commands.setInlineCode();
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
       * 设置行内代码 / Set inline code
       *
       * 已是行内代码时自动取消 / Automatically toggles off when already inline code
       *
       * @returns 命令函数 / Command function
       */
      setInlineCode:
        () =>
        ({ commands, editor }) => {
          const isActive = editor.isActive(this.name);

          if (isActive) {
            return commands.unsetMark(this.name);
          }

          return commands.setMark(this.name);
        },

      /**
       * 清除行内代码 / Unset inline code
       *
       * @returns 命令函数 / Command function
       */
      unsetInlineCode:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineCode: {
      /**
       * 设置行内代码 / Set inline code
       *
       * 已是行内代码时自动取消 / Automatically toggles off when already inline code
       *
       * @returns 返回值类型 / Return type
       */
      setInlineCode: () => ReturnType;

      /**
       * 清除行内代码 / Unset inline code
       *
       * @returns 返回值类型 / Return type
       */
      unsetInlineCode: () => ReturnType;
    };
  }
}
