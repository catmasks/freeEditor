import { Mark } from "@tiptap/core";

/**
 * 上标标记 / Superscript mark
 */
export const Superscript = Mark.create({
  name: "superscript",

  priority: 1000,

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "sup",
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
          if (value === "super") {
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
    return ["sup", {}, 0];
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Ctrl/Cmd + Shift + . 切换上标 / Ctrl/Cmd + Shift + . toggle superscript
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-Shift-.": () => {
        return this.editor.commands.setSuperscript();
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
       * 设置上标 / Set superscript
       *
       * 已是上标时自动取消 / Automatically toggles off when already superscript
       * 上标和下标互斥，设置上标时会先清除下标
       *
       * @returns 命令函数 / Command function
       */
      setSuperscript:
        () =>
        ({ commands, editor }) => {
          const isActive = editor.isActive(this.name);

          if (isActive) {
            return commands.unsetMark(this.name);
          }

          // 上标和下标互斥，先清除下标
          if (editor.isActive("subscript")) {
            commands.unsetMark("subscript");
          }

          return commands.setMark(this.name);
        },

      /**
       * 清除上标 / Unset superscript
       *
       * @returns 命令函数 / Command function
       */
      unsetSuperscript:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});

/**
 * 上标 schema 扩展 / Superscript schema extension
 *
 * 仅保留 mark schema，命令和快捷键由 Superscript feature 扩展注册。
 */
export const SuperscriptSchema = Superscript.extend({
  addKeyboardShortcuts() {
    return {};
  },

  addCommands() {
    return {};
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    superscript: {
      /**
       * 设置上标 / Set superscript
       *
       * 已是上标时自动取消，上标和下标互斥 / Automatically toggles off when already superscript, superscript and subscript are mutually exclusive
       *
       * @returns 返回值类型 / Return type
       */
      setSuperscript: () => ReturnType;

      /**
       * 清除上标 / Unset superscript
       *
       * @returns 返回值类型 / Return type
       */
      unsetSuperscript: () => ReturnType;
    };
  }
}
