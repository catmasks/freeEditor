import { Extension } from "@tiptap/core";

/**
 * 字号扩展 / Font size extension
 *
 * 为 style mark 添加字号属性 / Adds font size attribute to style mark
 */
export const CustomFontSize = Extension.create({
  name: "fontSize",

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
          fontSize: {
            default: null,

            /**
             * 解析 HTML 属性 / Parse HTML attribute
             *
             * @param element HTML 元素 / HTML element
             * @returns 字号值或 null / Font size value or null
             */
            parseHTML: (element) => {
              return element.style.fontSize || null;
            },
          },
        },
      },
    ];
  },

  /**
   * 注册命令 / Register commands
   *
   * @returns 命令对象 / Command object
   */
  addCommands() {
    return {
      /**
       * 设置字号 / Set font size
       *
       * @param fontSize 字号值，传 null 则清除 / Font size value, pass null to clear
       * @returns 命令函数 / Command function
       */
      setFontSize:
        (fontSize?: string | null) =>
        ({ chain, editor }) => {
          if (!fontSize) {
            const attrs = editor.getAttributes("style");

            return chain()
              .setMark("style", {
                ...attrs,
                fontSize: null,
              })
              .run();
          }

          return chain()
            .setMark("style", {
              fontSize,
            })
            .run();
        },

      /**
       * 清除字号 / Unset font size
       *
       * @returns 命令函数 / Command function
       */
      unsetFontSize:
        () =>
        ({ chain, editor }) => {
          const attrs = editor.getAttributes("style");

          return chain()
            .setMark("style", {
              ...attrs,
              fontSize: null,
            })
            .run();
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * 设置字号 / Set font size
       *
       * @param fontSize 字号值，传 null 则清除 / Font size value, pass null to clear
       * @returns 返回值类型 / Return type
       */
      setFontSize: (fontSize?: string | null) => ReturnType;

      /**
       * 清除字号 / Unset font size
       *
       * @returns 返回值类型 / Return type
       */
      unsetFontSize: () => ReturnType;
    };
  }
}
