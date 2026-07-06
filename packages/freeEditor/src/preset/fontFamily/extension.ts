import { Extension } from "@tiptap/core";

/**
 * 字体扩展 / Font family extension
 *
 * 为 style mark 添加字体属性 / Adds font family attribute to style mark
 */
export const CustomFontFamily = Extension.create({
  name: "fontFamily",

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
          fontFamily: {
            default: null,

            /**
             * 解析 HTML 属性 / Parse HTML attribute
             *
             * @param element HTML 元素 / HTML element
             * @returns 字体名称或 null / Font family name or null
             */
            parseHTML: (element) => {
              return element.style.fontFamily || null;
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
       * 设置字体 / Set font family
       *
       * @param fontFamily 字体名称，传 null 则清除 / Font family name, pass null to clear
       * @returns 命令函数 / Command function
       */
      setFontFamily:
        (fontFamily?: string | null) =>
        ({ chain, editor }) => {
          if (!fontFamily) {
            const attrs = editor.getAttributes("style");

            return chain()
              .setMark("style", {
                ...attrs,
                fontFamily: null,
              })
              .run();
          }

          return chain()
            .setMark("style", {
              fontFamily,
            })
            .run();
        },

      /**
       * 清除字体 / Unset font family
       *
       * @returns 命令函数 / Command function
       */
      unsetFontFamily:
        () =>
        ({ chain, editor }) => {
          const attrs = editor.getAttributes("style");

          return chain()
            .setMark("style", {
              ...attrs,
              fontFamily: null,
            })
            .run();
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontFamily: {
      /**
       * 设置字体 / Set font family
       *
       * @param fontFamily 字体名称，传 null 则清除 / Font family name, pass null to clear
       * @returns 返回值类型 / Return type
       */
      setFontFamily: (fontFamily?: string | null) => ReturnType;

      /**
       * 清除字体 / Unset font family
       *
       * @returns 返回值类型 / Return type
       */
      unsetFontFamily: () => ReturnType;
    };
  }
}
