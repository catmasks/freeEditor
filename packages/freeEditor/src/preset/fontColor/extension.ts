import { Extension } from "@tiptap/core";

/**
 * 字体颜色扩展 / Font color extension
 *
 * 为 style mark 添加颜色属性 / Adds color attribute to style mark
 */
export const CustomFontColor = Extension.create({
  name: "color",

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
          color: {
            default: null,

            /**
             * 解析 HTML 属性 / Parse HTML attribute
             *
             * @param element HTML 元素 / HTML element
             * @returns 颜色值或 null / Color value or null
             */
            parseHTML: (element) => {
              return element.style.color || null;
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
       * 设置字体颜色 / Set font color
       *
       * @param color 颜色值，传 null 则清除 / Color value, pass null to clear
       * @returns 命令函数 / Command function
       */
      setColor:
        (color?: string | null) =>
        ({ chain, editor }) => {
          if (!color) {
            const attrs = editor.getAttributes("style");

            return chain()
              .setMark("style", {
                ...attrs,
                color: null,
              })
              .run();
          }

          return chain()
            .setMark("style", {
              color,
            })
            .run();
        },

      /**
       * 清除字体颜色 / Unset font color
       *
       * @returns 命令函数 / Command function
       */
      unsetColor:
        () =>
        ({ chain, editor }) => {
          const attrs = editor.getAttributes("style");

          return chain()
            .setMark("style", {
              ...attrs,
              color: null,
            })
            .run();
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    color: {
      /**
       * 设置字体颜色 / Set font color
       *
       * @param color 颜色值，传 null 则清除 / Color value, pass null to clear
       * @returns 返回值类型 / Return type
       */
      setColor: (color?: string | null) => ReturnType;

      /**
       * 清除字体颜色 / Unset font color
       *
       * @returns 返回值类型 / Return type
       */
      unsetColor: () => ReturnType;
    };
  }
}
