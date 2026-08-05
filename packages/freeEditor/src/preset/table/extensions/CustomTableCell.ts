/**
 * 表格单元格
 */
import { Node, mergeAttributes } from "@tiptap/core";

export const CustomTableCell = Node.create({
  name: "tableCell",

  /**
   * 重点：
   * group 不能和 name 重名
   */
  group: "table_cell",

  content: "block+",

  isolating: true,

  addAttributes() {
    return {
      colspan: {
        default: 1,
      },

      rowspan: {
        default: 1,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "td",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["td", mergeAttributes(HTMLAttributes), 0];
  },
});
