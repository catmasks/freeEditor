import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 任务列表项节点 / Task list item node
 *
 * 支持复选框 checked 属性 / Supports checkbox checked attribute
 */
export const TaskItem = Node.create({
  name: "taskItem",

  addOptions() {
    return {
      HTMLAttributes: {},
      nested: true,
    };
  },

  content: "paragraph block*",

  defining: true,

  draggable: true,

  addAttributes() {
    return {
      checked: {
        default: false,
        parseHTML: (element: HTMLElement): boolean =>
          element
            .querySelector("input[type=checkbox]")
            ?.hasAttribute("checked") ?? false,
        renderHTML: (
          attributes: Record<string, unknown>,
        ): Record<string, string> => {
          return {
            "data-checked": attributes.checked ? "true" : "false",
          };
        },
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
        tag: "li[data-type=taskItem]",
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
      "li",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "taskItem",
      }),
      [
        "label",
        [
          "input",
          {
            type: "checkbox",
            contenteditable: "false",
            ...(HTMLAttributes?.["data-checked"] === "true"
              ? { checked: "checked" }
              : {}),
          },
        ],
        ["span", { class: "task-item-checkbox-custom" }],
      ],
      [
        "div",
        {
          class: "task-item-content",
        },
        0,
      ],
    ];
  },

  /**
   * 添加节点视图 / Add node view
   *
   * 用于处理复选框点击事件 / Handles checkbox click events
   */
  addNodeView() {
    return ({
      node,
      editor,
      getPos,
    }): {
      dom: HTMLLIElement;
      contentDOM: HTMLDivElement;
      update: (updatedNode: any) => boolean;
    } => {
      const dom = document.createElement("li");
      dom.classList.add("task-item");
      dom.setAttribute("data-type", "taskItem");
      dom.setAttribute("data-checked", node.attrs.checked ? "true" : "false");

      const checkboxWrapper = document.createElement("label");
      checkboxWrapper.classList.add("task-item-checkbox-wrapper");
      checkboxWrapper.contentEditable = "false";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = node.attrs.checked;
      checkbox.classList.add("task-item-checkbox");

      const checkboxCustom = document.createElement("span");
      checkboxCustom.classList.add("task-item-checkbox-custom");

      checkboxWrapper.appendChild(checkbox);
      checkboxWrapper.appendChild(checkboxCustom);

      const content = document.createElement("div");
      content.classList.add("task-item-content");

      dom.appendChild(checkboxWrapper);
      dom.appendChild(content);

      checkbox.addEventListener("change", () => {
        if (typeof getPos === "function") {
          const pos = getPos();
          if (pos !== undefined) {
            const transaction = editor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              checked: checkbox.checked,
            });
            editor.view.dispatch(transaction);
          }
        }
      });

      return {
        dom,
        contentDOM: content,
        update: (updatedNode: any): boolean => {
          if (updatedNode.type !== this.type) {
            return false;
          }
          dom.setAttribute(
            "data-checked",
            updatedNode.attrs.checked ? "true" : "false",
          );
          checkbox.checked = updatedNode.attrs.checked;
          return true;
        },
      };
    };
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Enter 键分割任务项 / Enter key splits task item
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      Enter: (): boolean => {
        return this.editor.commands.splitListItem(this.name);
      },

      /**
       * Tab 键增加缩进（下沉任务项） / Tab key increases indent (sinks task item)
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      Tab: (): boolean => {
        return this.editor.commands.sinkListItem(this.name);
      },

      /**
       * Shift + Tab 键减少缩进（提升任务项） / Shift + Tab key decreases indent (lifts task item)
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Shift-Tab": (): boolean => {
        return this.editor.commands.liftListItem(this.name);
      },
    };
  },
});
