import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 表格行
 */
export const CustomTableRow = Node.create({
  name: "tableRow",

  /**
   * 使用 group
   */
  content: "table_cell+",

  parseHTML() {
    return [
      {
        tag: "tr",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["tr", mergeAttributes(HTMLAttributes), 0];
  },
});
