import { Mark, mergeAttributes } from "@tiptap/core";

/**
 * 链接标记 / Link mark
 */
export const CustomLink = Mark.create({
  name: "link",

  priority: 1000,

  inclusive: false,

  /**
   * 默认配置 / Default options
   *
   * @returns 默认选项对象 / Default options object
   */
  addOptions() {
    return {
      HTMLAttributes: {},

      /**
       * 是否点击打开链接 / Whether to open link on click
       */
      openOnClick: false,
    };
  },

  /**
   * 标记属性 / Mark attributes
   *
   * @returns 属性定义对象 / Attribute definition object
   */
  addAttributes() {
    return {
      /**
       * 链接地址 / Link href
       */
      href: {
        default: null,
      },

      /**
       * 打开方式 / Target attribute
       */
      target: {
        default: "_blank",
      },

      /**
       * 安全属性 / Rel attribute
       */
      rel: {
        default: "noopener noreferrer nofollow",
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
        tag: "a[href]",
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
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
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
       * 设置链接 / Set link
       *
       * @param attrs 链接属性 / Link attributes
       * @returns 命令函数 / Command function
       */
      setLink:
        (attrs) =>
        ({ chain }) => {
          return chain()
            .extendMarkRange(this.name)

            .setMark(this.name, {
              target: "_blank",

              rel: "noopener noreferrer nofollow",

              ...attrs,
            })
            .run();
        },

      /**
       * 清除链接 / Unset link
       *
       * @returns 命令函数 / Command function
       */
      unsetLink:
        () =>
        ({ chain }) => {
          return chain()
            .extendMarkRange(this.name)

            .unsetMark(this.name)
            .run();
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    link: {
      /**
       * 设置链接 / Set link
       *
       * @param attrs 链接属性 / Link attributes
       * @param attrs.href 链接地址 / Link href
       * @param attrs.target 打开方式 / Target attribute
       * @param attrs.rel 安全属性 / Rel attribute
       * @returns 返回值类型 / Return type
       */
      setLink: (attrs: {
        href: string;

        target?: string;

        rel?: string;
      }) => ReturnType;

      /**
       * 清除链接 / Unset link
       *
       * @returns 返回值类型 / Return type
       */
      unsetLink: () => ReturnType;
    };
  }
}
