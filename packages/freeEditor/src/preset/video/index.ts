import { CustomVideo } from "./extension";

import { createVideoToolbar } from "./toolbar";

import { handleUploadFiles } from "../../core/utils/useMediaUploader";

import { i18n } from "../../core";

import type { EditorPlugin, EditorPluginContext } from "../../core";
import type { Editor } from "@tiptap/core";

const createMediaFloatingToolbarContent = (
  editor: Editor,
  mediaType: "image" | "video" | "attachment",
): HTMLElement => {
  const wrap = document.createElement("div");

  wrap.style.display = "flex";

  wrap.style.alignItems = "center";

  wrap.style.gap = "4px";

  const btn = (
    text: string,

    fn: () => void,

    className = "",
  ) => {
    const el = document.createElement("span");

    el.className = `free-editor__media-node__action ${className}`;

    el.textContent = text;

    el.style.cursor = "pointer";

    el.style.padding = "4px 8px";

    el.style.borderRadius = "6px";

    el.style.fontSize = "13px";

    el.style.whiteSpace = "nowrap";

    el.onmousedown = (e) => {
      e.stopPropagation();
    };

    el.onclick = (e) => {
      e.stopPropagation();

      fn();
    };

    return el;
  };

  if (mediaType === "attachment") {
    wrap.appendChild(
      btn(
        i18n.t("media.openFile"),
        () => {
          const attrs = editor.getAttributes(mediaType);
          if (attrs.src) {
            window.open(attrs.src, "_blank", "noopener,noreferrer");
          }
        },
        "primary",
      ),
    );

    wrap.appendChild(
      btn(
        i18n.t("common.remove"),
        () => {
          editor.chain().focus().deleteSelection().run();
        },
        "danger",
      ),
    );

    return wrap;
  }

  const setPresetWidth = (p: number) => {
    const width = `${p * 100}%`;
    const { state, view } = editor;
    const { selection } = state;
    const nodeSel = selection as any;
    if (nodeSel.node) {
      const pos = selection.from;
      view.dispatch(
        state.tr.setNodeMarkup(pos, undefined, {
          ...nodeSel.node.attrs,
          width,
          height: "auto",
        }),
      );
    }
  };

  const resetSize = () => {
    const { state, view } = editor;
    const { selection } = state;
    const nodeSel = selection as any;
    if (nodeSel.node) {
      const pos = selection.from;
      view.dispatch(
        state.tr.setNodeMarkup(pos, undefined, {
          ...nodeSel.node.attrs,
          width: "auto",
          height: "auto",
        }),
      );
    }
  };

  wrap.appendChild(btn("30%", () => setPresetWidth(0.3), "primary"));

  wrap.appendChild(btn("50%", () => setPresetWidth(0.5), "primary"));

  wrap.appendChild(btn("100%", () => setPresetWidth(1), "primary"));

  wrap.appendChild(
    btn(i18n.t("media.resetSize"), () => resetSize(), "primary"),
  );

  wrap.appendChild(
    btn(
      i18n.t("common.remove"),
      () => {
        editor.chain().focus().deleteSelection().run();
      },
      "danger",
    ),
  );

  return wrap;
};

const getSelectedMediaNode = (
  editor: Editor,
  nodeType: string,
): HTMLElement | null => {
  const { state, view } = editor;
  const { selection } = state;
  const nodeSel = selection as any;

  if (!nodeSel.node || nodeSel.node.type.name !== nodeType) {
    return null;
  }

  const dom = view.nodeDOM(selection.from);
  if (dom instanceof HTMLElement) {
    const wrapper = dom.querySelector(".free-editor__media-resizer");
    if (wrapper instanceof HTMLElement) {
      return wrapper;
    }
    return dom;
  }

  return null;
};

/**
 * 视频插件 / Video plugin
 *
 * 支持视频插入、拖拽上传、粘贴上传 / Supports video insertion, drag upload, paste upload
 */
export const VideoPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "video",

  /**
   * 扩展实例数组 / Extension instance array
   */
  extensions: [CustomVideo],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createVideoToolbar,

  /**
   * 插件初始化 / Plugin setup
   *
   * @param editor 编辑器实例 / Editor instance
   * @param context 插件上下文 / Plugin context
   * @returns 清理函数 / Cleanup function
   */
  setup(editor, context: EditorPluginContext) {
    const handleVideos = (files: File[]) => {
      handleUploadFiles(editor, files, "video");
    };

    const offDrop = context.mediaEngine?.onDrop("video", (files) => {
      handleVideos(files);
    });

    const offPaste = context.mediaEngine?.onPaste("video", (files) => {
      handleVideos(files);
    });

    const unregister = editor.storage.floatingToolbar?.registerItem({
      key: "video",
      matchNodes: ["video"],
      priority: 20,
      placement: "top-center",
      offset: 8,
      getTarget: (ed) => getSelectedMediaNode(ed, "video"),
      render: (ed) => createMediaFloatingToolbarContent(ed, "video"),
    });

    return () => {
      offDrop?.();

      offPaste?.();

      unregister?.();
    };
  },
};
