import { Extension } from "@tiptap/core";

import { Plugin, PluginKey } from "@tiptap/pm/state";

import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { Node } from "@tiptap/pm/model";

import { i18n, isEmptyDocument } from "../../../core/index";

/**
 * Placeholder 目标节点 / Placeholder target node
 *
 * 用于描述 Placeholder 应该挂载到哪个节点。
 */
export interface PlaceholderTarget {
  /**
   * 目标节点 / Target node
   */
  node: Node;

  /**
   * 节点在 Document 中的起始位置 / Node start position in Document
   */
  pos: number;
}

/**
 * 获取 Placeholder 目标节点 / Get Placeholder target node
 *
 * Placeholder 属于编辑器级别的占位提示，
 * 因此只允许挂载到 Document 的直接子级空文本块。
 *
 * 不会进入：
 * - table cell
 * - table header
 * - blockquote
 * - list item
 * - nested custom node
 *
 * @param doc ProseMirror Document 节点 / ProseMirror document node
 * @returns Placeholder 目标节点，不存在时返回 null
 */
export function getPlaceholderTarget(doc: Node): PlaceholderTarget | null {
  /**
   * 只有整个文档为空时才寻找 Placeholder 目标。
   */
  if (!isEmptyDocument(doc)) {
    return null;
  }

  /**
   * 只检查 Document 的直接子节点。
   *
   * 不使用 descendants()，
   * 避免进入 table、blockquote、list 等嵌套结构。
   */
  let target: PlaceholderTarget | null = null;

  doc.forEach((node, pos) => {
    /**
     * 已经找到目标节点后不再继续寻找。
     */
    if (target) {
      return;
    }

    /**
     * Placeholder 只能显示在文本块上。
     */
    if (!node.isTextblock) {
      return;
    }

    /**
     * 当前文本块存在实际内容时跳过。
     *
     * 这里使用 content.size 判断即可，
     * 因为 isEmptyDocument 已经确认整个文档没有有效内容。
     */
    if (node.content.size > 0) {
      return;
    }

    target = {
      node,
      pos,
    };
  });

  return target;
}

/**
 * 占位符扩展 / Placeholder extension
 *
 * 在空文本块中显示占位提示文本 / Displays placeholder text in empty text blocks
 */
export const PlaceholderPlugin = Extension.create({
  name: "placeholder",

  /**
   * 默认选项 / Default options
   *
   * @returns 默认选项对象 / Default options object
   */
  addOptions() {
    return {
      /**
       * 占位文本 / Placeholder text
       */
      placeholder: "",
    };
  },

  /**
   * 添加 ProseMirror 插件 / Add ProseMirror plugins
   *
   * @returns 插件数组 / Plugin array
   */
  addProseMirrorPlugins() {
    const placeholderOption = this.options.placeholder;

    return [
      new Plugin({
        key: new PluginKey("placeholder"),

        props: {
          /**
           * 装饰器 / Decorations
           *
           * @param doc 文档节点 / Document node
           * @returns 装饰器集合 / Decoration set
           */
          decorations: ({ doc }) => {
            /**
             * 获取 Placeholder 目标节点。
             */
            const target = getPlaceholderTarget(doc);

            /**
             * 文档存在内容，
             * 或者没有可用于显示 Placeholder 的目标节点。
             */
            if (!target) {
              return DecorationSet.empty;
            }

            /**
             * 获取占位文本。
             */
            const placeholderText =
              placeholderOption || i18n.t("common.placeholder");

            /**
             * 创建 Placeholder 装饰器。
             */
            const decoration = Decoration.node(
              target.pos,
              target.pos + target.node.nodeSize,
              {
                class: "is-empty",
                "data-placeholder": placeholderText,
              },
            );

            return DecorationSet.create(doc, [decoration]);
          },
        },
      }),
    ];
  },
});
