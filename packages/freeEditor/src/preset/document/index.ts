import { Node } from "@tiptap/core";

/**
 * 文档节点 / Document node
 *
 * 编辑器的顶级节点，包含所有块级内容 / The top-level node of the editor, containing all block-level content
 */
export const CustomDocument = Node.create({
  name: "doc",

  topNode: true,

  content: "block+",
});
