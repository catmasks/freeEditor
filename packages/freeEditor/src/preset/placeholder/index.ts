import { Extension } from "@tiptap/core";

import { Plugin, PluginKey } from "@tiptap/pm/state";

import { Decoration, DecorationSet } from "@tiptap/pm/view";

import { i18n } from "../../core/index";

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
            const decorations: Decoration[] = [];

            const placeholderText =
              placeholderOption || i18n.t("common.placeholder");

            doc.descendants((node, pos) => {
              if (!node.isTextblock) {
                return;
              }

              if (node.content.size > 0) {
                return;
              }

              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: "is-empty",

                  "data-placeholder": placeholderText,
                }),
              );
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
