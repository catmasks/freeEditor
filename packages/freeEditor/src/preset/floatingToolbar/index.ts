import { Extension } from "@tiptap/core";

import { FloatingToolbar } from "../../ui/components/FloatingToolbar/index";

import type {
  FloatingPlacement,
  FloatingToolbarItem,
  FloatingToolbarAPI,
} from "../../core";

import type { Editor } from "@tiptap/core";

export type { FloatingToolbarItem, FloatingToolbarAPI, FloatingPlacement };

/**
 * 悬浮工具栏扩展 / Floating toolbar extension
 *
 * 通用悬浮工具栏，自动识别当前光标聚焦的节点/标记，
 * 选择性展示悬浮工具栏，支持其他插件注册工具栏项
 *
 * Universal floating toolbar that automatically recognizes the currently
 * focused node/mark and selectively displays the toolbar. Supports
 * registration of toolbar items from other plugins.
 */
export const FloatingToolbarPlugin = Extension.create({
  name: "floatingToolbar",

  /**
   * 预初始化存储 / Pre-initialize storage
   * 确保 editor.storage.floatingToolbar 永远不为 undefined
   */
  addStorage() {
    const items = new Map<string, FloatingToolbarItem>();

    let toolbar: FloatingToolbar | null = null;

    let refreshRaf: number | null = null;

    let lastVisibleKeys: string = "";

    let lastTargetKey: string = "";

    let handleSelectionUpdate: (() => void) | null = null;

    let currentEditor: Editor | null = null;

    let autoRefresh = true;

    const getVisibleItems = (): FloatingToolbarItem[] => {
      if (!currentEditor || currentEditor.isDestroyed) return [];

      const { state } = currentEditor;

      const { selection } = state;

      const result: FloatingToolbarItem[] = [];

      for (const item of items.values()) {
        let shouldShow = false;

        if (item.matchNodes && item.matchNodes.length > 0) {
          const { $from } = selection;

          for (let d = $from.depth; d >= 0; d--) {
            const node = $from.node(d);

            if (node && item.matchNodes.includes(node.type.name)) {
              shouldShow = true;

              break;
            }
          }

          if (!shouldShow) {
            const nodeSel = selection as any;

            if (
              nodeSel.node &&
              item.matchNodes?.includes(nodeSel.node.type.name)
            ) {
              shouldShow = true;
            }
          }
        }

        if (!shouldShow && item.matchMarks && item.matchMarks.length > 0) {
          for (const markName of item.matchMarks) {
            if (currentEditor.isActive(markName)) {
              shouldShow = true;

              break;
            }
          }
        }

        if (!shouldShow && item.shouldShow) {
          shouldShow = item.shouldShow(currentEditor);
        }

        if (shouldShow) {
          result.push(item);
        }
      }

      result.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      return result;
    };

    const getSelectionRect = (): DOMRect | null => {
      if (!currentEditor || currentEditor.isDestroyed) return null;

      const { view } = currentEditor;

      const { selection } = view.state;

      if (selection.empty) {
        const pos = view.coordsAtPos(selection.from);

        return new DOMRect(pos.left, pos.top, 0, pos.bottom - pos.top);
      }

      const from = view.coordsAtPos(selection.from);

      const to = view.coordsAtPos(selection.to);

      const left = Math.min(from.left, to.left);

      const right = Math.max(from.right, to.right);

      const top = Math.min(from.top, to.top);

      const bottom = Math.max(from.bottom, to.bottom);

      return new DOMRect(left, top, right - left, bottom - top);
    };

    const getTargetForItem = (
      item: FloatingToolbarItem,
    ): HTMLElement | DOMRect | null => {
      if (!currentEditor) return null;

      if (item.getTarget) {
        return item.getTarget(currentEditor);
      }

      return getSelectionRect();
    };

    const buildContent = (visibleItems: FloatingToolbarItem[]): HTMLElement => {
      if (!currentEditor) {
        return document.createElement("div");
      }

      const container = document.createElement("div");

      container.className = "floating-toolbar__content";

      for (const item of visibleItems) {
        const el = item.render(currentEditor);

        if (el) {
          container.appendChild(el);
        }
      }

      return container;
    };

    const refresh = () => {
      if (!currentEditor || currentEditor.isDestroyed) return;

      const visibleItems = getVisibleItems();

      const visibleKeys = visibleItems.map((i) => i.key).join(",");

      const firstKey = visibleItems[0]?.key || "";

      if (visibleItems.length === 0) {
        hide();

        lastVisibleKeys = "";

        lastTargetKey = "";

        return;
      }

      const firstItem = visibleItems[0];

      const target = getTargetForItem(firstItem);

      if (!target) {
        hide();

        lastVisibleKeys = "";

        lastTargetKey = "";

        return;
      }

      const placement = firstItem.placement || "top-center";

      const offset = firstItem.offset ?? 4;

      if (!toolbar) {
        toolbar = new FloatingToolbar({
          target,
          placement,
          offset,
          content: buildContent(visibleItems),
          closeOnEsc: true,
        });

        toolbar.show();
      } else {
        toolbar.setTarget(target);

        toolbar.setPlacement(placement);

        toolbar.setOffset(offset);

        if (visibleKeys !== lastVisibleKeys) {
          toolbar.setContent(buildContent(visibleItems));
        }

        if (!toolbar.isVisible()) {
          toolbar.show();
        }
      }

      lastVisibleKeys = visibleKeys;

      lastTargetKey = firstKey;
    };

    const scheduleRefresh = () => {
      if (!autoRefresh) {
        return;
      }

      if (refreshRaf !== null) {
        return;
      }

      refreshRaf = requestAnimationFrame(() => {
        refreshRaf = null;

        refresh();
      });
    };

    const show = (target: HTMLElement | DOMRect) => {
      if (!currentEditor || currentEditor.isDestroyed) return;

      const visibleItems = getVisibleItems();

      if (visibleItems.length === 0) return;

      const firstItem = visibleItems[0];

      const placement = firstItem.placement || "top-center";

      const offset = firstItem.offset ?? 4;

      const content = buildContent(visibleItems);

      if (!toolbar) {
        toolbar = new FloatingToolbar({
          target,
          placement,
          offset,
          content,
          closeOnEsc: true,
        });
      } else {
        toolbar.setTarget(target);

        toolbar.setPlacement(placement);

        toolbar.setOffset(offset);

        toolbar.setContent(content);
      }

      toolbar.show();
    };

    const hide = () => {
      toolbar?.hide();
    };

    const isVisible = (): boolean => {
      return toolbar?.isVisible() || false;
    };

    const setAutoRefresh = (enabled: boolean): void => {
      autoRefresh = enabled;

      if (!enabled) {
        if (refreshRaf !== null) {
          cancelAnimationFrame(refreshRaf);
          refreshRaf = null;
        }
        hide();
      } else {
        scheduleRefresh();
      }
    };

    const registerItem = (item: FloatingToolbarItem): (() => void) => {
      items.set(item.key, item);

      return () => {
        items.delete(item.key);
      };
    };

    const destroy = () => {
      if (refreshRaf !== null) {
        cancelAnimationFrame(refreshRaf);

        refreshRaf = null;
      }

      toolbar?.destroy();

      toolbar = null;

      items.clear();
    };

    return {
      registerItem,
      show,
      hide,
      refresh: scheduleRefresh,
      isVisible,
      setAutoRefresh,
      destroy,
      _setEditor: (editor: Editor) => {
        currentEditor = editor;
      },
      _setHandleSelectionUpdate: (handler: () => void) => {
        handleSelectionUpdate = handler;
      },
      _getHandleSelectionUpdate: () => handleSelectionUpdate,
    } as FloatingToolbarAPI & {
      _setEditor: (editor: Editor) => void;
      _setHandleSelectionUpdate: (handler: () => void) => void;
      _getHandleSelectionUpdate: () => (() => void) | null;
    };
  },

  /**
   * 编辑器创建前执行 / Executed before editor is created
   */
  onBeforeCreate() {
    const { editor } = this;

    const toolbarAPI = editor.storage.floatingToolbar as
      | (FloatingToolbarAPI & {
          _setEditor: (editor: Editor) => void;
          _setHandleSelectionUpdate: (handler: () => void) => void;
          _getHandleSelectionUpdate: () => (() => void) | null;
        })
      | undefined;

    if (!toolbarAPI) return;

    toolbarAPI._setEditor(editor);

    const localHandleSelectionUpdate = () => {
      toolbarAPI.refresh();
    };

    toolbarAPI._setHandleSelectionUpdate(localHandleSelectionUpdate);

    editor.on("selectionUpdate", localHandleSelectionUpdate);
  },

  /**
   * 扩展销毁时执行 / Executed when extension is destroyed
   */
  onDestroy() {
    const { editor } = this;

    const toolbarAPI = editor.storage.floatingToolbar as
      | (FloatingToolbarAPI & {
          _getHandleSelectionUpdate: () => (() => void) | null;
        })
      | undefined;

    const handler = toolbarAPI?._getHandleSelectionUpdate();

    if (handler) {
      editor.off("selectionUpdate", handler);
    }

    toolbarAPI?.destroy();
  },
});
