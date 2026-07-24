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

            parseHTML: (element) => {
              return element.style.textAlign || null;
            },

            renderHTML: (attributes) => {
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
        ({ tr, state, dispatch }) => {
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
        ({ tr, state, dispatch }) => {
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

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    alignment: {
      setAlignment: (alignment: string | null) => ReturnType;

      unsetAlignment: () => ReturnType;
    };
  }
}
