import { Mark } from "@tiptap/core";

/**
 * 下划线标记 / Underline mark
 */
export const Underline = Mark.create({
  name: "underline",

  priority: 1000,

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "u",
      },
      {
        tag: "ins",
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
          if (value === "underline") {
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
    return ["u", {}, 0];
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Ctrl/Cmd + U 切换下划线 / Ctrl/Cmd + U toggle underline
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-u": () => {
        return this.editor.commands.setUnderline();
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
       * 设置下划线 / Set underline
       *
       * 已是下划线时自动取消 / Automatically toggles off when already underline
       *
       * @returns 命令函数 / Command function
       */
      setUnderline:
        () =>
        ({ commands, editor }) => {
          const isActive = editor.isActive(this.name);

          if (isActive) {
            return commands.unsetMark(this.name);
          }

          return commands.setMark(this.name);
        },

      /**
       * 清除下划线 / Unset underline
       *
       * @returns 命令函数 / Command function
       */
      unsetUnderline:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    underline: {
      /**
       * 设置下划线 / Set underline
       *
       * 已是下划线时自动取消 / Automatically toggles off when already underline
       *
       * @returns 返回值类型 / Return type
       */
      setUnderline: () => ReturnType;

      /**
       * 清除下划线 / Unset underline
       *
       * @returns 返回值类型 / Return type
       */
      unsetUnderline: () => ReturnType;
    };
  }
}
