import type { NodeView as ProseMirrorNodeView } from "@tiptap/pm/view";

import type { NodeViewRendererProps } from "@tiptap/core";

import type { MediaNodeAttrs } from "./types";

import { MediaNodeView } from "./MediaNodeView";

import {
  createBaseNodeView,
  createDeleteNode,
} from "../uploadNode/mediaNodeViewShared";

/**
 * 媒体节点视图渲染器 / Media node view renderer
 * @param props 节点视图渲染器属性 / Node view renderer props
 * @returns ProseMirror 节点视图 / ProseMirror node view
 */
export function MediaNodeViewRenderer(
  props: NodeViewRendererProps,
): ProseMirrorNodeView {
  const container = document.createElement("span");

  /**
   * 更新节点属性 / Update node attributes
   * @param attrs 部分属性 / Partial attributes
   */
  const updateAttributes = (attrs: Partial<MediaNodeAttrs>) => {
    const pos = props.getPos();

    if (typeof pos !== "number") {
      return;
    }

    const node = props.editor.state.doc.nodeAt(pos);

    if (!node || node.isText) {
      return;
    }

    props.editor.view.dispatch(
      props.editor.state.tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        ...attrs,
      }),
    );
  };

  const deleteNode = createDeleteNode(props);

  const view = new MediaNodeView({
    container,

    attrs: props.node.attrs as MediaNodeAttrs,

    selected: false,

    updateAttributes,

    deleteNode,

    uploader: props.editor.storage.mediaUploader,
  });

  return {
    ...createBaseNodeView<MediaNodeAttrs>(view, props),

    /**
     * 选中节点 / Select node
     */
    selectNode() {
      view.setSelected(true);
    },

    /**
     * 取消选中节点 / Deselect node
     */
    deselectNode() {
      view.setSelected(false);
    },
  };
}
