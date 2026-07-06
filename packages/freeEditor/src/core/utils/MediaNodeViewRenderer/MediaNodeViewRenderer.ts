import type { NodeView as ProseMirrorNodeView } from "@tiptap/pm/view";

import type { NodeViewRendererProps } from "@tiptap/core";

import type { MediaNodeAttrs } from "./types";

import { MediaNodeView } from "./MediaNodeView";

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

    if (!node) {
      return;
    }

    props.editor.view.dispatch(
      props.editor.state.tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        ...attrs,
      }),
    );
  };

  /**
   * 删除节点 / Delete node
   */
  const deleteNode = () => {
    const pos = props.getPos();

    if (typeof pos !== "number") {
      return;
    }

    props.editor
      .chain()
      .focus()
      .deleteRange({
        from: pos,
        to: pos + props.node.nodeSize,
      })
      .run();
  };

  const view = new MediaNodeView({
    container,

    attrs: props.node.attrs as MediaNodeAttrs,

    selected: false,

    updateAttributes,

    deleteNode,

    uploader: props.editor.storage.mediaUploader,
  });

  return {
    /**
     * 根 DOM 元素 / Root DOM element
     */
    dom: view.getElement(),

    /**
     * 更新节点 / Update node
     * @param updatedNode 更新后的节点 / Updated node
     * @returns 是否更新成功 / Whether update succeeded
     */
    update(updatedNode) {
      if (updatedNode.type.name !== props.node.type.name) {
        return false;
      }

      view.update(updatedNode.attrs as MediaNodeAttrs);

      return true;
    },

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

    /**
     * 销毁视图 / Destroy view
     */
    destroy() {
      view.destroy();
    },
  };
}
