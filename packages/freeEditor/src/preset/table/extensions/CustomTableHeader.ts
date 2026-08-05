import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 表头
 */
export const CustomTableHeader = Node.create({
  name: "tableHeader",

  /**
   * 必须同 group
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
        tag: "th",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["th", mergeAttributes(HTMLAttributes), 0];
  },
});
