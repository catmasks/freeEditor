import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 标题节点 / Heading node
 */
export const CustomHeading = Node.create({
  name: "heading",

  group: "block",

  content: "inline*",

  defining: true,

  /**
   * 默认选项 / Default options
   *
   * @returns 默认选项对象 / Default options object
   */
  addOptions() {
    return {
      HTMLAttributes: {},

      /**
       * 支持的标题等级 / Supported heading levels
       */
      levels: [1, 2, 3, 4, 5, 6],
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
       * 标题等级 / Heading level
       */
      level: {
        default: 1,

        /**
         * 解析 HTML 属性 / Parse HTML attribute
         *
         * @param element HTML 元素 / HTML element
         * @returns 标题等级 / Heading level
         */
        parseHTML: (element) => {
          const tag = element.tagName.toLowerCase();

          const level = Number(tag.replace("h", ""));

          return this.options.levels.includes(level) ? level : 1;
        },

        /**
         * 渲染 HTML 属性 / Render HTML attribute
         *
         * @returns HTML 属性对象 / HTML attributes object
         */
        renderHTML: () => {
          return {};
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
    return this.options.levels.map((level: number) => ({
      tag: `h${level}`,
      attrs: {
        level,
      },
    }));
  },

  /**
   * 渲染 HTML / Render HTML
   *
   * @param node 节点实例 / Node instance
   * @param HTMLAttributes HTML 属性 / HTML attributes
   * @returns HTML 渲染描述 / HTML render description
   */
  renderHTML({ node, HTMLAttributes }) {
    const level = this.options.levels.includes(node.attrs.level)
      ? node.attrs.level
      : 1;

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      "Mod-Alt-1": () => {
        return this.editor.commands.setHeading({
          level: 1,
        });
      },

      "Mod-Alt-2": () => {
        return this.editor.commands.setHeading({
          level: 2,
        });
      },

      "Mod-Alt-3": () => {
        return this.editor.commands.setHeading({
          level: 3,
        });
      },

      "Mod-Alt-4": () => {
        return this.editor.commands.setHeading({
          level: 4,
        });
      },

      "Mod-Alt-5": () => {
        return this.editor.commands.setHeading({
          level: 5,
        });
      },

      "Mod-Alt-6": () => {
        return this.editor.commands.setHeading({
          level: 6,
        });
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
       * 设置标题 / Set heading
       *
       * 已是同级标题时自动取消 / Automatically toggles off when already at the same level
       *
       * @param attrs 标题属性 / Heading attributes
       * @param attrs.level 标题等级 / Heading level
       * @returns 命令函数 / Command function
       */
      setHeading:
        (attrs: { level: number }) =>
        ({ commands, editor }) => {
          if (!this.options.levels.includes(attrs.level)) {
            return false;
          }

          const current = editor.getAttributes(this.name);

          const isActive = editor.isActive(this.name, {
            level: attrs.level,
          });

          if (isActive && current.level === attrs.level) {
            return commands.setNode("paragraph");
          }

          return commands.setNode(this.name, attrs);
        },

      /**
       * 清除标题 / Unset heading
       *
       * @returns 命令函数 / Command function
       */
      unsetHeading:
        () =>
        ({ commands }) => {
          return commands.setNode("paragraph");
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    heading: {
      /**
       * 设置标题 / Set heading
       *
       * 已是同级标题时自动取消 / Automatically toggles off when already at the same level
       *
       * @param attrs 标题属性 / Heading attributes
       * @param attrs.level 标题等级 / Heading level
       * @returns 返回值类型 / Return type
       */
      setHeading: (attrs: { level: number }) => ReturnType;

      /**
       * 清除标题 / Unset heading
       *
       * @returns 返回值类型 / Return type
       */
      unsetHeading: () => ReturnType;
    };
  }
}
