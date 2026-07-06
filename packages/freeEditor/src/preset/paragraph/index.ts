import { Node } from "@tiptap/core";

/**
 * 段落节点 / Paragraph node
 */
export const CustomParagraph = Node.create({
  name: "paragraph",

  group: "block",

  content: "inline*",

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "p",
      },
    ];
  },

  /**
   * 渲染 HTML / Render HTML
   *
   * @returns HTML 渲染描述 / HTML render description
   */
  renderHTML() {
    return ["p", 0];
  },
});
