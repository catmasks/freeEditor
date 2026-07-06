import { Mark, mergeAttributes } from "@tiptap/core";

/**
 * 公共样式 Mark 扩展 / Common style Mark extension
 */
export const Style = Mark.create({
  name: "style",

  priority: 1000,

  /**
   * 获取默认选项 / Get default options
   * @returns 默认选项对象 / Default options object
   */
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  /**
   * 解析 HTML 规则 / Parse HTML rules
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "span[style]",
      },
    ];
  },

  /**
   * 渲染 HTML / Render HTML
   * @param HTMLAttributes HTML 属性 / HTML attributes
   * @returns HTML 渲染描述 / HTML render description
   */
  renderHTML({ HTMLAttributes }) {
    const styles: string[] = [];

    Object.entries(HTMLAttributes).forEach(([key, value]) => {
      if (!value) return;

      const cssKey = key.replace(
        /[A-Z]/g,
        (match) => `-${match.toLowerCase()}`,
      );

      styles.push(`${cssKey}: ${value}`);
    });

    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, {
        style: styles.join("; "),
      }),
      0,
    ];
  },
});
