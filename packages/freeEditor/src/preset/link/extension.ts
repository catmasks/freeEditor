import { Mark, mergeAttributes } from "@tiptap/core";

import { Plugin, TextSelection } from "@tiptap/pm/state";

import { FloatingToolbar } from "../../ui/components/FloatingToolbar";

import { i18n } from "../../core/i18n";

/**
 * 链接标记 / Link mark
 */
export const CustomLink = Mark.create({
  name: "link",

  priority: 1000,

  inclusive: false,

  /**
   * 默认配置 / Default options
   *
   * @returns 默认选项对象 / Default options object
   */
  addOptions() {
    return {
      HTMLAttributes: {},

      /**
       * 是否点击打开链接 / Whether to open link on click
       */
      openOnClick: false,
    };
  },

  /**
   * 标记属性 / Mark attributes
   *
   * @returns 属性定义对象 / Attribute definition object
   */
  addAttributes() {
    return {
      /**
       * 链接地址 / Link href
       */
      href: {
        default: null,
      },

      /**
       * 打开方式 / Target attribute
       */
      target: {
        default: "_blank",
      },

      /**
       * 安全属性 / Rel attribute
       */
      rel: {
        default: "noopener noreferrer nofollow",
      },
    };
  },

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "a[href]",
      },
    ];
  },

  /**
   * 渲染 HTML / Render HTML
   *
   * @param HTMLAttributes HTML 属性 / HTML attributes
   * @returns HTML 渲染描述 / HTML render description
   */
  renderHTML({ HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  /**
   * 添加 ProseMirror 插件 / Add ProseMirror plugins
   *
   * @returns 插件数组 / Plugin array
   */
  addProseMirrorPlugins() {
    const editor = this.editor;
    const options = this.options;

    let floatingToolbar: FloatingToolbar | null = null;
    let rafId: number | null = null;
    let blurTimer: number | null = null;

    /**
     * 查找指定位置所在链接的边界 / Find link bounds at given position
     *
     * 只扩展到同一个链接（相同 mark），不会包含相邻的其他链接 /
     * Only extends to the same link (same mark), won't include adjacent links
     *
     * @param doc 文档 / Document
     * @param pos 位置 / Position
     * @returns 链接的起止位置 / Link start and end positions
     */
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
     * 创建工具栏内容 / Create toolbar content
     *
     * @returns 工具栏根元素 / Toolbar root element
     */
    const createToolbarContent = () => {
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
          e.preventDefault();
        };
        btn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
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
          floatingToolbar?.hide();
        },
        "danger",
      );

      wrap.appendChild(openBtn);
      wrap.appendChild(removeBtn);

      return wrap;
    };

    /**
     * 更新工具栏位置和显示状态 / Update toolbar position and visibility
     */
    const updateToolbar = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        rafId = null;

        if (!editor.isEditable) {
          floatingToolbar?.hide();
          return;
        }

        if (!editor.isActive("link")) {
          floatingToolbar?.hide();
          return;
        }

        const { state, view } = editor;
        const { selection } = state;

        if (!view) {
          floatingToolbar?.hide();
          return;
        }

        const bounds = findLinkBounds(state.doc, selection.from);

        if (!bounds || bounds.start >= bounds.end) {
          floatingToolbar?.hide();
          return;
        }

        const start = bounds.start;
        const end = bounds.end;

        const startCoords = view.coordsAtPos(start);
        const endCoords = view.coordsAtPos(end);

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

        if (!floatingToolbar) {
          floatingToolbar = new FloatingToolbar({
            target: rect,
            placement: "top-center",
            offset: 6,
            content: createToolbarContent(),
          });
        } else {
          floatingToolbar.setTarget(rect);
          floatingToolbar.setContent(createToolbarContent());
        }

        floatingToolbar.show();
      });
    };

    /**
     * 选区更新处理 / Selection update handler
     */
    const handleSelectionUpdate = () => {
      updateToolbar();
    };

    /**
     * 失焦处理 / Blur handler
     */
    const handleBlur = () => {
      if (blurTimer !== null) {
        clearTimeout(blurTimer);
      }

      blurTimer = window.setTimeout(() => {
        blurTimer = null;
        floatingToolbar?.hide();
      }, 150);
    };

    /**
     * 聚焦处理 / Focus handler
     */
    const handleFocus = () => {
      if (blurTimer !== null) {
        clearTimeout(blurTimer);
        blurTimer = null;
      }
      updateToolbar();
    };

    editor.on("selectionUpdate", handleSelectionUpdate);
    editor.on("transaction", handleSelectionUpdate);
    editor.on("blur", handleBlur);
    editor.on("focus", handleFocus);

    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              const target = event.target as HTMLElement;
              const link = target.closest("a");

              if (link) {
                event.preventDefault();

                const posInfo = view.posAtDOM(link, 0);
                const pos =
                  typeof posInfo === "number"
                    ? posInfo
                    : ((posInfo as any)?.pos ?? 0);

                const bounds = findLinkBounds(view.state.doc, pos);

                if (bounds && bounds.start < bounds.end) {
                  const tr = view.state.tr.setSelection(
                    TextSelection.create(
                      view.state.doc,
                      bounds.start,
                      bounds.end,
                    ),
                  );
                  view.dispatch(tr);
                }

                view.focus();

                return true;
              }

              return false;
            },
            click: () => {
              setTimeout(() => updateToolbar(), 0);
              return false;
            },
          },
        },
        destroy() {
          if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
          if (blurTimer !== null) {
            clearTimeout(blurTimer);
            blurTimer = null;
          }
          editor.off("selectionUpdate", handleSelectionUpdate);
          editor.off("transaction", handleSelectionUpdate);
          editor.off("blur", handleBlur);
          editor.off("focus", handleFocus);
          floatingToolbar?.destroy();
          floatingToolbar = null;
        },
      }),
    ];
  },

  /**
   * 命令集合 / Command collection
   *
   * @returns 命令对象 / Command object
   */
  addCommands() {
    return {
      /**
       * 设置链接 / Set link
       *
       * @param attrs 链接属性 / Link attributes
       * @returns 命令函数 / Command function
       */
      setLink:
        (attrs) =>
        ({ chain }) => {
          return chain()
            .extendMarkRange(this.name)

            .setMark(this.name, {
              target: "_blank",

              rel: "noopener noreferrer nofollow",

              ...attrs,
            })
            .run();
        },

      /**
       * 清除链接 / Unset link
       *
       * @returns 命令函数 / Command function
       */
      unsetLink:
        () =>
        ({ chain }) => {
          return chain()
            .extendMarkRange(this.name)

            .unsetMark(this.name)
            .run();
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    link: {
      /**
       * 设置链接 / Set link
       *
       * @param attrs 链接属性 / Link attributes
       * @param attrs.href 链接地址 / Link href
       * @param attrs.target 打开方式 / Target attribute
       * @param attrs.rel 安全属性 / Rel attribute
       * @returns 返回值类型 / Return type
       */
      setLink: (attrs: {
        href: string;

        target?: string;

        rel?: string;
      }) => ReturnType;

      /**
       * 清除链接 / Unset link
       *
       * @returns 返回值类型 / Return type
       */
      unsetLink: () => ReturnType;
    };
  }
}
