import { Mark } from "@tiptap/core";

/**
 * 删除线标记 / Strike mark
 */
export const Strike = Mark.create({
  name: "strike",

  priority: 1000,

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "del",
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
          if (value === "strike") {
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
    return ["del", {}, 0];
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Ctrl/Cmd + S 切换删除线 / Ctrl/Cmd + S toggle strike
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-s": () => {
        return this.editor.commands.setStrike();
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
       * 设置删除线 / Set strike
       *
       * 已是删除线时自动取消 / Automatically toggles off when already strike
       *
       * @returns 命令函数 / Command function
       */
      setStrike:
        () =>
        ({ commands, editor }) => {
          const isActive = editor.isActive(this.name);

          if (isActive) {
            return commands.unsetMark(this.name);
          }

          return commands.setMark(this.name);
        },

      /**
       * 清除删除线 / Unset strike
       *
       * @returns 命令函数 / Command function
       */
      unsetStrike:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    strike: {
      /**
       * 设置删除线 / Set strike
       *
       * 已是删除线时自动取消 / Automatically toggles off when already strike
       *
       * @returns 返回值类型 / Return type
       */
      setStrike: () => ReturnType;

      /**
       * 清除删除线 / Unset strike
       *
       * @returns 返回值类型 / Return type
       */
      unsetStrike: () => ReturnType;
    };
  }
}
