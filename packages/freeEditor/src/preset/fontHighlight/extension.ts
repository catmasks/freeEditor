import { Extension } from "@tiptap/core";

/**
 * 文本高亮扩展 / Font highlight extension
 *
 * 为 style mark 添加背景色属性 / Adds background color attribute to style mark
 */
export const CustomFontHighlight = Extension.create({
  name: "fontHighlight",

  /**
   * 添加全局属性 / Add global attributes
   *
   * @returns 全局属性配置数组 / Global attributes configuration array
   */
  addGlobalAttributes() {
    return [
      {
        types: ["style"],

        attributes: {
          backgroundColor: {
            default: null,

            /**
             * 解析 HTML 属性 / Parse HTML attribute
             *
             * @param element HTML 元素 / HTML element
             * @returns 背景色值或 null / Background color value or null
             */
            parseHTML: (element) => {
              return element.style.backgroundColor || null;
            },
          },
        },
      },
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
       * 设置高亮 / Set highlight
       *
       * 相同颜色自动取消 / Automatically toggles off with the same color
       *
       * @param backgroundColor 背景色值 / Background color value
       * @returns 命令函数 / Command function
       */
      setHighlight:
        (backgroundColor?: string | null) =>
        ({ chain, editor }) => {
          const attrs = editor.getAttributes("style");

          if (attrs.backgroundColor === backgroundColor) {
            return chain()
              .setMark("style", {
                ...attrs,
                backgroundColor: null,
              })
              .run();
          }

          return chain()
            .setMark("style", {
              ...attrs,
              backgroundColor: backgroundColor || "#fff59d",
            })
            .run();
        },

      /**
       * 清除高亮 / Unset highlight
       *
       * @returns 命令函数 / Command function
       */
      unsetHighlight:
        () =>
        ({ chain, editor }) => {
          const attrs = editor.getAttributes("style");

          return chain()
            .setMark("style", {
              ...attrs,
              backgroundColor: null,
            })
            .run();
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    highlight: {
      /**
       * 设置高亮 / Set highlight
       *
       * 相同颜色自动取消 / Automatically toggles off with the same color
       *
       * @param backgroundColor 背景色值 / Background color value
       * @returns 返回值类型 / Return type
       */
      setHighlight: (backgroundColor?: string | null) => ReturnType;

      /**
       * 清除高亮 / Unset highlight
       *
       * @returns 返回值类型 / Return type
       */
      unsetHighlight: () => ReturnType;
    };
  }
}
