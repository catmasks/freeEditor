import { Mark } from "@tiptap/core";

/**
 * 下标标记 / Subscript mark
 */
export const Subscript = Mark.create({
  name: "subscript",

  priority: 1000,

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "sub",
      },
      {
        style: "vertical-align",
        /**
         * 获取属性 / Get attributes
         *
         * @param value 样式值 / Style value
         * @returns 属性对象或 false / Attribute object or false
         */
        getAttrs: (value) => {
          if (value === "sub") {
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
    return ["sub", {}, 0];
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Ctrl/Cmd + Shift + , 切换下标 / Ctrl/Cmd + Shift + , toggle subscript
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-Shift-,": () => {
        return this.editor.commands.setSubscript();
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
       * 设置下标 / Set subscript
       *
       * 已是下标时自动取消 / Automatically toggles off when already subscript
       * 下标和上标互斥，设置下标时会先清除上标
       *
       * @returns 命令函数 / Command function
       */
      setSubscript:
        () =>
        ({ commands, editor }) => {
          const isActive = editor.isActive(this.name);

          if (isActive) {
            return commands.unsetMark(this.name);
          }

          // 下标和上标互斥，先清除上标
          if (editor.isActive("superscript")) {
            commands.unsetMark("superscript");
          }

          return commands.setMark(this.name);
        },

      /**
       * 清除下标 / Unset subscript
       *
       * @returns 命令函数 / Command function
       */
      unsetSubscript:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    subscript: {
      /**
       * 设置下标 / Set subscript
       *
       * 已是下标时自动取消，下标和上标互斥 / Automatically toggles off when already subscript, subscript and superscript are mutually exclusive
       *
       * @returns 返回值类型 / Return type
       */
      setSubscript: () => ReturnType;

      /**
       * 清除下标 / Unset subscript
       *
       * @returns 返回值类型 / Return type
       */
      unsetSubscript: () => ReturnType;
    };
  }
}
