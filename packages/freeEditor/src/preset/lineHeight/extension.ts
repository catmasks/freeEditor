import { Extension } from "@tiptap/core";
import type { Node } from "@tiptap/pm/model";
import type { Selection, Transaction } from "@tiptap/pm/state";

/** 块级行高处理用节点的最小结构 / Minimal shape of a block. */
interface LineHeightBlock {
  type: { name: string };
  attrs: Record<string, unknown>;
}

/** 行高节点是否为需要处理的块级节点 / Whether the block handles line height. */
function isLineHeightBlock(
  node: LineHeightBlock | null | undefined,
): node is LineHeightBlock {
  return Boolean(
    node &&
      node.type &&
      ["paragraph", "heading"].includes(node.type.name),
  );
}

/**
 * 在选区范围内统一更新块级节点属性，并在空选区时顺沿祖先上溯。
 *
 * 抽出自 setLineHeight / unsetLineHeight 的公共逻辑，降低认知复杂度。
 */
function updateSelectionLineHeightAttribute(
  tr: Transaction,
  selection: Selection,
  doc: Node,
  setAttrs: (attrs: Record<string, unknown>) => Record<string, unknown>,
): void {
  doc.nodesBetween(selection.$from.pos, selection.$to.pos, (node, pos) => {
    if (isLineHeightBlock(node)) {
      tr.setNodeMarkup(pos, undefined, setAttrs(node.attrs));
    }
  });

  if (selection.empty) {
    for (let depth = selection.$from.depth; depth >= 0; depth--) {
      const node = selection.$from.node(depth);

      if (isLineHeightBlock(node)) {
        const nodePos = selection.$from.start(depth) - 1;
        const current = doc.nodeAt(nodePos);

        if (current) {
          tr.setNodeMarkup(nodePos, undefined, setAttrs(current.attrs));
        }
        break;
      }
    }
  }
}

export const LineHeight = Extension.create({
  name: "lineHeight",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],

        attributes: {
          lineHeight: {
            default: null,

            parseHTML: (element): string | null => {
              return element.style.lineHeight || null;
            },

            renderHTML: (
              attributes,
            ): Record<string, string> | Record<string, never> => {
              if (!attributes.lineHeight) {
                return {};
              }

              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string | null) =>
        ({ tr, state, dispatch }): boolean => {
          if (dispatch) {
            updateSelectionLineHeightAttribute(
              tr,
              state.selection,
              state.doc,
              (attrs) => ({ ...attrs, lineHeight }),
            );
            dispatch(tr);
          }
          return true;
        },

      unsetLineHeight:
        () =>
        ({ tr, state, dispatch }): boolean => {
          if (dispatch) {
            updateSelectionLineHeightAttribute(
              tr,
              state.selection,
              state.doc,
              (attrs) => ({ ...attrs, lineHeight: null }),
            );
            dispatch(tr);
          }
          return true;
        },
    };
  },
});

/**
 * 行高 schema 扩展 / Line height schema extension
 *
 * 仅保留全局属性 schema，命令由 LineHeight feature 扩展注册。
 */
export const LineHeightSchema = LineHeight.extend({
  addCommands() {
    return {};
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineHeight: {
      setLineHeight: (lineHeight: string | null) => ReturnType;

      unsetLineHeight: () => ReturnType;
    };
  }
}
