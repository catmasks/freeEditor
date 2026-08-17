import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 列表项节点 / List item node
 */
export const ListItem = Node.create({
  name: "listItem",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: "paragraph block*",

  defining: true,

  draggable: true,

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        /**
         * 排除带有 data-type 属性的 li（如 taskItem 的 li[data-type="taskItem"]）
         * Exclude li elements with data-type attribute (e.g. taskItem's li[data-type="taskItem"])
         */
        tag: "li:not([data-type])",
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
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  /**
   * 快捷键配置 / Keyboard shortcuts configuration
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Enter 键分割列表项 / Enter key splits list item
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      Enter: () => {
        return this.editor.commands.splitListItem(this.name);
      },

      /**
       * Tab 键增加缩进（下沉列表项） / Tab key increases indent (sinks list item)
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      Tab: () => {
        return this.editor.commands.sinkListItem(this.name);
      },

      /**
       * Shift + Tab 键减少缩进（提升列表项） / Shift + Tab key decreases indent (lifts list item)
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Shift-Tab": () => {
        return this.editor.commands.liftListItem(this.name);
      },
    };
  },
});
