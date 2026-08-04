import { Extension } from "@tiptap/core";

export const LineHeight = Extension.create({
  name: "lineHeight",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],

        attributes: {
          lineHeight: {
            default: null,

            parseHTML: (element) => {
              return element.style.lineHeight || null;
            },

            renderHTML: (attributes) => {
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
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { $from, $to } = selection;
          const { doc } = state;

          if (dispatch) {
            doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
              if (["paragraph", "heading"].includes(node.type.name)) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight: lineHeight,
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
                      lineHeight: lineHeight,
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

      unsetLineHeight:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { $from, $to } = selection;
          const { doc } = state;

          if (dispatch) {
            doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
              if (["paragraph", "heading"].includes(node.type.name)) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  lineHeight: null,
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
                      lineHeight: null,
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
