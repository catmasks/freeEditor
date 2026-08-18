import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 无序列表节点 / Bullet (unordered) list node
 */
export const BulletList = Node.create({
  name: "bulletList",

  group: "block list",

  content: "listItem+",

  /**
   * 默认选项 / Default options
   *
   * @returns 默认选项对象 / Default options object
   */
  addOptions() {
    return {
      HTMLAttributes: {},

      /**
       * 列表类型属性值 / List type attribute value
       *
       * 用于 HTML <ul type="..."> 支持的类型: disc, circle, square
       * Used for HTML <ul type="..."> supported types: disc, circle, square
       */
      listType: "disc",

      /**
       * 优先级（用于节点创建时的优先级比较）
       * Priority (used for priority comparison during node creation)
       */
      priority: 1000,
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
        /**
         * 排除带有 data-type 属性的 ul（如 taskList 的 ul[data-type="taskList"]）
         * Exclude ul elements with data-type attribute (e.g. taskList's ul[data-type="taskList"])
         */
        tag: "ul:not([data-type])",
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
      "ul",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        type: this.options.listType,
      }),
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
       * 设置无序列表 / Wrap in bullet list
       *
       * @returns 命令函数 / Command function
       */
      setBulletList:
        () =>
        ({ commands }): boolean => {
          return commands.wrapInList(this.name);
        },

      /**
       * 取消无序列表 / Unwrap from bullet list
       *
       * @returns 命令函数 / Command function
       */
      unsetBulletList:
        () =>
        ({ commands }): boolean => {
          return commands.liftListItem("listItem");
        },

      /**
       * 切换无序列表 / Toggle bullet list
       *
       * 已是无序列表时自动取消 / Automatically toggles off when already a bullet list
       *
       * @returns 命令函数 / Command function
       */
      toggleBulletList:
        () =>
        ({ chain, editor }): boolean => {
          const isActive = editor.isActive(this.name);
          if (isActive) {
            return chain().focus().liftListItem("listItem").run();
          }
          if (editor.isActive("orderedList")) {
            return chain()
              .focus()
              .liftListItem("listItem")
              .wrapInList(this.name)
              .run();
          }
          return chain().focus().wrapInList(this.name).run();
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
       * Ctrl/Cmd + Shift + 8 切换无序列表 / Ctrl/Cmd + Shift + 8 toggle bullet list
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-Shift-8": (): boolean => {
        return this.editor.commands.toggleBulletList();
      },
    };
  },
});

/**
 * 无序列表 schema 扩展 / Bullet list schema extension
 *
 * 仅保留 node schema，命令和快捷键由 BulletList feature 扩展注册。
 */
export const BulletListSchema = BulletList.extend({
  addKeyboardShortcuts() {
    return {};
  },

  addCommands() {
    return {};
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    bulletList: {
      /**
       * 设置无序列表 / Wrap in bullet (unordered) list
       *
       * @returns 返回值类型 / Return type
       */
      setBulletList: () => ReturnType;

      /**
       * 取消无序列表 / Unwrap from bullet list
       *
       * @returns 返回值类型 / Return type
       */
      unsetBulletList: () => ReturnType;

      /**
       * 切换无序列表 / Toggle bullet (unordered) list
       *
       * 已是无序列表时自动取消 / Automatically toggles off when already a bullet list
       *
       * @returns 返回值类型 / Return type
       */
      toggleBulletList: () => ReturnType;
    };
  }
}
