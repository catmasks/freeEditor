import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 段落节点 / Paragraph node
 *
 * 块级文本容器
 *
 * 支持:
 * - 普通文本
 * - 行内节点
 * - 空段落
 * - 自定义排版属性
 */
export const CustomParagraph = Node.create({
  name: "paragraph",

  /**
   * 节点所属分组
   */
  group: "block",

  /**
   * 允许包含所有 inline 内容
   */
  content: "inline*",

  /**
   * 定义默认属性
   */
  addAttributes() {
    return {
      alignment: {
        default: null,

        parseHTML(element) {
          return (
            element.style.textAlign ||
            element.getAttribute("data-align") ||
            null
          );
        },

        renderHTML(attributes) {
          if (!attributes.alignment) {
            return {};
          }

          return {
            style: `text-align:${attributes.alignment}`,
          };
        },
      },

      lineHeight: {
        default: null,

        parseHTML(element) {
          return (
            element.style.lineHeight ||
            element.getAttribute("data-line-height") ||
            null
          );
        },

        renderHTML(attributes) {
          if (!attributes.lineHeight) {
            return {};
          }

          return {
            style: `line-height:${attributes.lineHeight}`,
          };
        },
      },

      indent: {
        default: 0,

        parseHTML(element) {
          return Number(element.getAttribute("data-indent") || 0);
        },

        renderHTML(attributes) {
          if (!attributes.indent) {
            return {};
          }

          return {
            "data-indent": attributes.indent,
          };
        },
      },
    };
  },

  /**
   * HTML解析规则
   */
  parseHTML() {
    return [
      {
        tag: "p",
      },
    ];
  },

  /**
   * HTML输出
   */
  renderHTML({ HTMLAttributes }) {
    return ["p", mergeAttributes(HTMLAttributes), 0];
  },

  /**
   * 保留空白处理
   *
   * 避免 clipboard HTML 中的换行空格
   * 被转换成文本节点
   */
  whitespace: "normal",
});
