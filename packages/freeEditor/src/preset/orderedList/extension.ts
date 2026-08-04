import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 有序列表节点 / Ordered list node
 */
export const OrderedList = Node.create({
  name: "orderedList",

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
       * 是否递增编号 / Whether to increment numbering
       */
      incrementList: true,

      /**
       * 列表类型属性值 / List type attribute value
       *
       * 用于 HTML <ol type="..."> 支持的类型: 1, A, a, I, i
       * Used for HTML <ol type="..."> supported types: 1, A, a, I, i
       */
      listType: "1",

      /**
       * 优先级（用于节点创建时的优先级比较）
       * Priority (used for priority comparison during node creation)
       */
      priority: 1000,
    };
  },

  /**
   * 节点属性 / Node attributes
   *
   * @returns 属性定义对象 / Attribute definition object
   */
  addAttributes() {
    return {
      /**
       * 起始编号 / Start number
       */
      start: {
        default: 1,

        parseHTML: (element) => {
          return Number(element.getAttribute("start")) || 1;
        },

        renderHTML: (attributes) => {
          if (!attributes.start || attributes.start === 1) {
            return {};
          }

          return {
            start: attributes.start,
          };
        },
      },
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
        tag: "ol",
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
      "ol",
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
       * 设置有序列表 / Wrap in ordered list
       *
       * @returns 命令函数 / Command function
       */
      setOrderedList:
        () =>
        ({ commands }) => {
          return commands.wrapInList(this.name);
        },

      /**
       * 取消有序列表 / Unwrap from ordered list
       *
       * @returns 命令函数 / Command function
       */
      unsetOrderedList:
        () =>
        ({ commands }) => {
          return commands.liftListItem("listItem");
        },

      /**
       * 切换有序列表 / Toggle ordered list
       *
       * 已是有序列表时自动取消 / Automatically toggles off when already an ordered list
       *
       * @returns 命令函数 / Command function
       */
      toggleOrderedList:
        () =>
        ({ chain, editor }) => {
          const isActive = editor.isActive(this.name);
          if (isActive) {
            return chain().focus().liftListItem("listItem").run();
          }
          if (editor.isActive("bulletList")) {
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
       * Ctrl/Cmd + Shift + 7 切换有序列表 / Ctrl/Cmd + Shift + 7 toggle ordered list
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-Shift-7": () => {
        return this.editor.commands.toggleOrderedList();
      },
    };
  },
});

/**
 * 有序列表 schema 扩展 / Ordered list schema extension
 *
 * 仅保留 node schema，命令和快捷键由 OrderedList feature 扩展注册。
 */
export const OrderedListSchema = OrderedList.extend({
  addKeyboardShortcuts() {
    return {};
  },

  addCommands() {
    return {};
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    orderedList: {
      /**
       * 设置有序列表 / Wrap in ordered list
       *
       * @returns 返回值类型 / Return type
       */
      setOrderedList: () => ReturnType;

      /**
       * 取消有序列表 / Unwrap from ordered list
       *
       * @returns 返回值类型 / Return type
       */
      unsetOrderedList: () => ReturnType;

      /**
       * 切换有序列表 / Toggle ordered list
       *
       * 已是有序列表时自动取消 / Automatically toggles off when already an ordered list
       *
       * @returns 返回值类型 / Return type
       */
      toggleOrderedList: () => ReturnType;
    };
  }
}
