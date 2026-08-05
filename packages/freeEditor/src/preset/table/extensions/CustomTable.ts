import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 表格
 */
export const CustomTable = Node.create({
  name: "table",

  group: "block",

  content: "tableRow+",

  isolating: true,

  parseHTML() {
    return [
      {
        tag: "table",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["table", mergeAttributes(HTMLAttributes), ["tbody", 0]];
  },
});
