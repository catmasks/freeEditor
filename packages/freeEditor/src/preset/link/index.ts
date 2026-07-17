import { CustomLink } from "./extension";

import { createLinkToolbar } from "./toolbar";
import { i18n } from "../../core";
import type { EditorPlugin, EditorPluginContext } from "../../core";
import type { Editor } from "@tiptap/core";

const createFloatingToolbarContent = (editor: Editor): HTMLElement => {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.gap = "4px";

  const createBtn = (text: string, onClick: () => void, type = "") => {
    const btn = document.createElement("span");
    btn.className = `free-editor__media-node__action ${type}`;
    btn.textContent = text;
    btn.style.cursor = "pointer";
    btn.style.padding = "4px 8px";
    btn.style.borderRadius = "6px";
    btn.style.fontSize = "13px";
    btn.style.whiteSpace = "nowrap";
    btn.onmousedown = (e) => {
      e.stopPropagation();
    };
    btn.onclick = (e) => {
      e.stopPropagation();
      onClick();
    };
    return btn;
  };

  const openBtn = createBtn(
    i18n.t("link.openLink"),
    () => {
      const attrs = editor.getAttributes("link");
      if (attrs.href) {
        window.open(
          attrs.href,
          attrs.target || "_blank",
          "noopener,noreferrer",
        );
      }
    },
    "primary",
  );

  const removeBtn = createBtn(
    i18n.t("link.removeLink"),
    () => {
      editor.chain().focus().unsetLink().run();
    },
    "danger",
  );

  wrap.appendChild(openBtn);
  wrap.appendChild(removeBtn);

  return wrap;
};

const findLinkBounds = (
  doc: any,
  pos: number,
): { start: number; end: number } | null => {
  const $pos = doc.resolve(pos);
  const markType = doc.type.schema.marks.link;

  const parent = $pos.parent;
  const parentStart = $pos.start();

  let currentMark: any = null;

  const offset = $pos.parentOffset;
  const index = $pos.index();

  const nodeAtOffset = parent.maybeChild(index);
  if (nodeAtOffset && nodeAtOffset.isText) {
    const mark = nodeAtOffset.marks.find((m: any) => m.type === markType);
    if (mark) currentMark = mark;
  }

  if (!currentMark && offset === 0 && index > 0) {
    const prevNode = parent.maybeChild(index - 1);
    if (prevNode && prevNode.isText) {
      const mark = prevNode.marks.find((m: any) => m.type === markType);
      if (mark) currentMark = mark;
    }
  }

  if (!currentMark) {
    const before = $pos.nodeBefore;
    if (before && before.isText) {
      const mark = before.marks.find((m: any) => m.type === markType);
      if (mark) currentMark = mark;
    }
  }

  if (!currentMark) {
    const after = $pos.nodeAfter;
    if (after && after.isText) {
      const mark = after.marks.find((m: any) => m.type === markType);
      if (mark) currentMark = mark;
    }
  }

  if (!currentMark) return null;

  let linkStart = -1;
  let linkEnd = -1;
  let scanPos = parentStart;

  for (let i = 0; i < parent.childCount; i++) {
    const child = parent.child(i);
    const childEnd = scanPos + child.nodeSize;

    if (child.isText && child.marks.some((m: any) => currentMark.eq(m))) {
      if (linkStart === -1) linkStart = scanPos;
      linkEnd = childEnd;
    } else if (linkStart !== -1) {
      break;
    }

    scanPos = childEnd;
  }

  if (linkStart === -1 || linkEnd === -1 || linkStart >= linkEnd) {
    return null;
  }

  return { start: linkStart, end: linkEnd };
};

/**
 * 链接插件 / Link plugin
 */
export const LinkPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "link",

  /**
   * 扩展实例（配置关闭点击打开链接）/ Extension instance (configured to disable click-to-open)
   */
  extensions: CustomLink.configure({
    openOnClick: false,
  }),

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createLinkToolbar,

  /**
   * 插件初始化 / Plugin setup
   *
   * @param editor 编辑器实例 / Editor instance
   * @param context 插件上下文 / Plugin context
   * @returns 清理函数 / Cleanup function
   */
  setup(editor: Editor, context: EditorPluginContext) {
    const unregister = editor.storage.floatingToolbar?.registerItem({
      key: "link",
      matchMarks: ["link"],
      priority: 10,
      placement: "top-center",
      offset: 6,
      getTarget: (ed) => {
        const { state } = ed;
        const { selection } = state;
        const bounds = findLinkBounds(state.doc, selection.from);

        if (!bounds || bounds.start >= bounds.end) {
          return null;
        }

        const { view } = ed;
        const startCoords = view.coordsAtPos(bounds.start);
        const endCoords = view.coordsAtPos(bounds.end);

        const rect = {
          top: Math.min(startCoords.top, endCoords.top),
          left: startCoords.left,
          right: endCoords.right,
          bottom: Math.max(startCoords.bottom, endCoords.bottom),
          width: endCoords.right - startCoords.left,
          height: Math.abs(endCoords.bottom - startCoords.top),
          x: startCoords.left,
          y: Math.min(startCoords.top, endCoords.top),
          toJSON() {
            return this;
          },
        } as DOMRect;

        return rect;
      },
      render: (ed) => createFloatingToolbarContent(ed),
    });

    return () => {
      unregister?.();
    };
  },
};
