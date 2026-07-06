import { Mark } from "@tiptap/core";

/**
 * 粗体标记 / Bold mark
 */
export const Bold = Mark.create({
  name: "bold",

  priority: 1000,

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "strong",
      },
      {
        tag: "b",
      },
      {
        style: "font-weight",
        /**
         * 获取属性 / Get attributes
         *
         * @param value 样式值 / Style value
         * @returns 属性对象或 false / Attribute object or false
         */
        getAttrs: (value) => {
          if (value === "bold" || Number(value) >= 600) {
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
    return ["strong", {}, 0];
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Ctrl/Cmd + B 切换粗体 / Ctrl/Cmd + B toggle bold
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-b": () => {
        return this.editor.commands.setBold();
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
       * 设置粗体 / Set bold
       *
       * 已是粗体时自动取消 / Automatically toggles off when already bold
       *
       * @returns 命令函数 / Command function
       */
      setBold:
        () =>
        ({ commands, editor }) => {
          const isActive = editor.isActive(this.name);

          if (isActive) {
            return commands.unsetMark(this.name);
          }

          return commands.setMark(this.name);
        },

      /**
       * 清除粗体 / Unset bold
       *
       * @returns 命令函数 / Command function
       */
      unsetBold:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    bold: {
      /**
       * 设置粗体 / Set bold
       *
       * 已是粗体时自动取消 / Automatically toggles off when already bold
       *
       * @returns 返回值类型 / Return type
       */
      setBold: () => ReturnType;

      /**
       * 清除粗体 / Unset bold
       *
       * @returns 返回值类型 / Return type
       */
      unsetBold: () => ReturnType;
    };
  }
}
