import { Extension } from "@tiptap/core";

export const TextAlign = Extension.create({
  name: "textAlign",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],

        attributes: {
          textAlign: {
            default: null,

            parseHTML: (element) => {
              return element.style.textAlign || null;
            },

            renderHTML: (attributes) => {
              if (!attributes.textAlign) {
                return {};
              }

              return {
                style: `text-align: ${attributes.textAlign}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment: string | null) =>
        ({ tr, state, dispatch }) => {
          const { selection } = state;
          const { $from, $to } = selection;
          const { doc } = state;

          if (dispatch) {
            doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
              if (["paragraph", "heading"].includes(node.type.name)) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  textAlign: alignment,
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
                      textAlign: alignment,
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

      unsetTextAlign:
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
                  textAlign: null,
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
                      textAlign: null,
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

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (alignment: string | null) => ReturnType;

      unsetTextAlign: () => ReturnType;
    };
  }
}
