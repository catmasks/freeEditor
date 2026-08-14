import { Node, mergeAttributes } from "@tiptap/core";
import type { NodeView as ProseMirrorNodeView } from "@tiptap/pm/view";
import type { NodeViewRendererProps } from "@tiptap/core";

import type { MediaNodeAttrs } from "../MediaNodeViewRenderer/types";
import {
  createActionButton,
  updateProgressText,
} from "./mediaNodeViewShared";

function renderPlaceholder(
  attrs: MediaNodeAttrs,
  uploader?: {
    cancel: (id: string) => void;
  },
): HTMLElement {
  const el = document.createElement("span");

  el.className = "free-editor__media-node free-editor__upload-placeholder";
  el.contentEditable = "false";

  const wrapper = document.createElement("span");

  wrapper.className = "free-editor__media-resizer";
  wrapper.dataset.type = attrs.type || "image";

  if (attrs.type === "attachment") {
    wrapper.style.display = "inline";
    wrapper.style.verticalAlign = "baseline";
    wrapper.style.lineHeight = "inherit";
    wrapper.style.width = "auto";
    wrapper.style.maxWidth = "none";
    wrapper.style.position = "static";
  } else {
    wrapper.style.display = "inline-block";
    wrapper.style.maxWidth = "100%";
    wrapper.style.verticalAlign = "middle";
    wrapper.style.lineHeight = "0";
    wrapper.style.position = "relative";
  }

  const box = document.createElement("span");

  box.className = "free-editor__media-loading";
  box.title = attrs.name || "";

  const spinner = document.createElement("span");

  spinner.className = "free-editor__spinner";

  const progress = document.createElement("span");

  progress.className = "free-editor__progress";
  progress.textContent = `${attrs.progress || 0}%`;

  const cancel = createActionButton("cancel", () => {
    if (attrs.id) {
      uploader?.cancel(attrs.id);
    }
  });

  if (attrs.type !== "attachment") {
    cancel.style.marginTop = "8px";
  }

  box.appendChild(spinner);
  box.appendChild(progress);
  box.appendChild(cancel);
  wrapper.appendChild(box);
  el.appendChild(wrapper);

  return el;
}

function UploadPlaceholderNodeView(
  props: NodeViewRendererProps,
): ProseMirrorNodeView {
  let attrs = props.node.attrs as MediaNodeAttrs;
  const dom = renderPlaceholder(attrs, props.editor.storage.mediaUploader);

  return {
    dom,

    update(updatedNode) {
      if (updatedNode.type.name !== props.node.type.name) {
        return false;
      }

      attrs = updatedNode.attrs as MediaNodeAttrs;

      updateProgressText(
        dom,
        ".free-editor__progress",
        attrs.progress || 0,
      );

      return true;
    },
  };
}

export const UploadPlaceholder = Node.create({
  name: "uploadPlaceholder",

  inline: true,

  group: "inline",

  atom: true,

  selectable: false,

  draggable: false,

  addAttributes() {
    return {
      id: {
        default: null,
      },

      name: {
        default: "",
      },

      type: {
        default: "image",
      },

      progress: {
        default: 0,
      },

      loading: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-upload-placeholder]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-upload-placeholder": "",
      }),
    ];
  },

  addNodeView() {
    return UploadPlaceholderNodeView;
  },
});

export const UploadPlaceholderSchema = UploadPlaceholder.extend({
  addNodeView() {
    return undefined as any;
  },
});
