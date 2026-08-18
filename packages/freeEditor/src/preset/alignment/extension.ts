import { Extension } from "@tiptap/core";

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
          const { selection } = state;
          const { $from, $to } = selection;
          const { doc } = state;

          if (dispatch) {
            doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
              if (["paragraph", "heading"].includes(node.type.name)) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  alignment: alignment,
                });
              }
            });

            if (selection.empty) {
              for (let d = $from.depth; d >= 0; d--) {
                const node = $from.node(d);
                if (node && ["paragraph", "heading"].includes(node.type.name)) {
                  const nodePos = $from.start(d) - 1;
                  const currentNode = doc.nodeAt(nodePos);
                  if (currentNode) {
                    tr.setNodeMarkup(nodePos, undefined, {
                      ...currentNode.attrs,
                      alignment: alignment,
                    });
                  }
                  break;
                }
              }
            }

            dispatch(tr);
          }

          return true;
        },

      unsetAlignment:
        () =>
        ({ tr, state, dispatch }): boolean => {
          const { selection } = state;
          const { $from, $to } = selection;
          const { doc } = state;

          if (dispatch) {
            doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
              if (["paragraph", "heading"].includes(node.type.name)) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  alignment: null,
                });
              }
            });

            if (selection.empty) {
              for (let d = $from.depth; d >= 0; d--) {
                const node = $from.node(d);
                if (node && ["paragraph", "heading"].includes(node.type.name)) {
                  const nodePos = $from.start(d) - 1;
                  const currentNode = doc.nodeAt(nodePos);
                  if (currentNode) {
                    tr.setNodeMarkup(nodePos, undefined, {
                      ...currentNode.attrs,
                      alignment: null,
                    });
                  }
                  break;
                }
              }
            }

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
