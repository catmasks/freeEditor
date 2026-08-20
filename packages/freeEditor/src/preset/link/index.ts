import type { Editor } from "@tiptap/core";
import { CustomLink, CustomLinkSchema } from "./extension";
import { createLinkToolbar } from "./toolbar";
import { i18n } from "../../core/index";
import type { EditorPlugin, EditorPluginContext } from "../../core/index";

const createFloatingToolbarContent = (editor: Editor): HTMLElement => {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.gap = "4px";

  const createBtn = (
    text: string,
    onClick: () => void,
    type = "",
  ): HTMLElement => {
    const btn = document.createElement("span");
    btn.className = `free-editor__media-node__action ${type}`;
    btn.textContent = text;
    btn.style.cursor = "pointer";
    btn.style.padding = "4px 8px";
    btn.style.borderRadius = "6px";
    btn.style.fontSize = "13px";
    btn.style.whiteSpace = "nowrap";
    btn.onmousedown = (e: MouseEvent): void => {
      e.stopPropagation();
    };
    btn.onclick = (e: MouseEvent): void => {
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

/**
 * 尝试从候选节点中查找链接标记。
 * Try to find a link mark from a candidate node.
 *
 * @param node - 候选节点 / Candidate node.
 * @param markType - 链接标记类型 / Link mark type.
 * @returns 链接标记，或 null / Link mark, or null.
 */
function tryFindMarkInNode(node: any, markType: any): any {
  if (!node || !node.isText) return null;
  return node.marks.find((m: any) => m.type === markType) || null;
}

/**
 * 在指定位置查找当前链接标记。
 * Find the current link mark at a given position.
 *
 * @param doc - ProseMirror 文档对象 / ProseMirror document.
 * @param pos - 位置 / Position.
 * @returns 链接标记，或 null / Link mark, or null.
 */
function findCurrentMark(doc: any, pos: number): any {
  const $pos = doc.resolve(pos);
  const markType = doc.type.schema.marks.link;
  const parent = $pos.parent;
  const index = $pos.index();
  const offset = $pos.parentOffset;

  // 从当前偏移位置查找 / Try to find from current offset
  const markAtOffset = tryFindMarkInNode(parent.maybeChild(index), markType);
  if (markAtOffset) return markAtOffset;

  // 尝试前一个节点（在偏移为 0 时）/ Try previous node (when offset is 0)
  if (offset === 0 && index > 0) {
    const markPrev = tryFindMarkInNode(parent.maybeChild(index - 1), markType);
    if (markPrev) return markPrev;
  }

  // 尝试 nodeBefore / Try nodeBefore
  const markBefore = tryFindMarkInNode($pos.nodeBefore, markType);
  if (markBefore) return markBefore;

  // 尝试 nodeAfter / Try nodeAfter
  const markAfter = tryFindMarkInNode($pos.nodeAfter, markType);
  if (markAfter) return markAfter;

  return null;
}

/**
 * 扫描父节点，查找链接标记的起始和结束位置。
 * Scan parent node to find the start and end positions of a link mark.
 *
 * @param parent - 父节点 / Parent node.
 * @param parentStart - 父节点起始位置 / Parent node start position.
 * @param currentMark - 当前链接标记 / Current link mark.
 * @returns 链接的起始和结束位置，或 null / Link start and end positions, or null.
 */
function scanLinkBounds(
  parent: any,
  parentStart: number,
  currentMark: any,
): { start: number; end: number } | null {
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
}

const findLinkBounds = (
  doc: any,
  pos: number,
): { start: number; end: number } | null => {
  const $pos = doc.resolve(pos);
  const parent = $pos.parent;
  const parentStart = $pos.start();

  const currentMark = findCurrentMark(doc, pos);
  if (!currentMark) return null;

  return scanLinkBounds(parent, parentStart, currentMark);
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
  schema: [
    CustomLinkSchema.configure({
      openOnClick: false,
    }),
  ],

  extensions: [
    CustomLink.configure({
      openOnClick: false,
    }),
  ],

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
  setup(editor: Editor, _context: EditorPluginContext) {
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
