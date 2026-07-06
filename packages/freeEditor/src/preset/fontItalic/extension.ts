import { Mark } from "@tiptap/core";

/**
 * 斜体标记 / Italic mark
 */
export const Italic = Mark.create({
  name: "italic",

  priority: 1000,

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "em",
      },
      {
        tag: "i",
      },
      {
        style: "font-style",
        /**
         * 获取属性 / Get attributes
         *
         * @param value 样式值 / Style value
         * @returns 属性对象或 false / Attribute object or false
         */
        getAttrs: (value) => {
          if (value === "italic") {
            return {};
          }

          return false;
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
    return ["em", {}, 0];
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Ctrl/Cmd + I 切换斜体 / Ctrl/Cmd + I toggle italic
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-i": () => {
        return this.editor.commands.setItalic();
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
       * 设置斜体 / Set italic
       *
       * 已是斜体时自动取消 / Automatically toggles off when already italic
       *
       * @returns 命令函数 / Command function
       */
      setItalic:
        () =>
        ({ commands, editor }) => {
          const isActive = editor.isActive(this.name);

          if (isActive) {
            return commands.unsetMark(this.name);
          }

          return commands.setMark(this.name);
        },

      /**
       * 清除斜体 / Unset italic
       *
       * @returns 命令函数 / Command function
       */
      unsetItalic:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    italic: {
      /**
       * 设置斜体 / Set italic
       *
       * 已是斜体时自动取消 / Automatically toggles off when already italic
       *
       * @returns 返回值类型 / Return type
       */
      setItalic: () => ReturnType;

      /**
       * 清除斜体 / Unset italic
       *
       * @returns 返回值类型 / Return type
       */
      unsetItalic: () => ReturnType;
    };
  }
}
