import { Extension } from "@tiptap/core";
import type { Node } from "@tiptap/pm/model";
import type { Selection, Transaction } from "@tiptap/pm/state";

/** 块级节点的最小结构 / Minimal shape of a block node. */
interface BlockNode {
  type: { name: string };
  attrs: Record<string, unknown>;
}

/** 是否为需要处理对齐的块级节点 / Whether the node handles alignment. */
function isAlignedBlock(node: BlockNode | null | undefined): node is BlockNode {
  return Boolean(
    node && node.type && ["paragraph", "heading"].includes(node.type.name),
  );
}

/**
 * 在选区范围内统一更新块级节点属性，并在空选区时顺沿祖先上溯。
 *
 * @param tr 事务对象 / The transaction
 * @param selection 当前选区 / The current selection
 * @param doc 文档 / The document
 * @param setAttrs 由原有 attributes 生成新 attributes 的函数
 */
function updateSelectionBlockAttribute(
  tr: Transaction,
  selection: Selection,
  doc: Node,
  setAttrs: (attrs: Record<string, unknown>) => Record<string, unknown>,
): void {
  doc.nodesBetween(selection.$from.pos, selection.$to.pos, (node, pos) => {
    if (isAlignedBlock(node)) {
      tr.setNodeMarkup(pos, undefined, setAttrs(node.attrs));
    }
  });

  if (selection.empty) {
    for (let depth = selection.$from.depth; depth >= 0; depth--) {
      const node = selection.$from.node(depth);

      if (isAlignedBlock(node)) {
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

export const Alignment = Extension.create({
  name: "alignment",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],

        attributes: {
          alignment: {
            default: null,

            parseHTML: (element: HTMLElement): string | null => {
              return element.style.textAlign || null;
            },

            renderHTML: (
              attributes: Record<string, unknown>,
            ): Record<string, string> => {
              if (!attributes.alignment) {
                return {};
              }

              return {
                style: `text-align: ${attributes.alignment}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setAlignment:
        (alignment: string | null) =>
        ({ tr, state, dispatch }): boolean => {
          if (dispatch) {
            updateSelectionBlockAttribute(
              tr,
              state.selection,
              state.doc,
              (attrs) => ({ ...attrs, alignment }),
            );
            dispatch(tr);
          }
          return true;
        },

      unsetAlignment:
        () =>
        ({ tr, state, dispatch }): boolean => {
          if (dispatch) {
            updateSelectionBlockAttribute(
              tr,
              state.selection,
              state.doc,
              (attrs) => ({ ...attrs, alignment: null }),
            );
            dispatch(tr);
          }
          return true;
        },
    };
  },
});

/**
 * 对齐 schema 扩展 / Alignment schema extension
 *
 * 仅保留全局属性 schema，命令由 Alignment feature 扩展注册。
 */
export const AlignmentSchema = Alignment.extend({
  addCommands() {
    return {};
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    alignment: {
      setAlignment: (alignment: string | null) => ReturnType;

      unsetAlignment: () => ReturnType;
    };
  }
}
