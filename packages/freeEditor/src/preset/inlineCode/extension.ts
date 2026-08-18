import { Mark, mergeAttributes } from "@tiptap/core";

/**
 * 行内代码标记 / Inline code mark
 *
 * 用于标记文本为行内代码样式（`<code>`），支持快捷键、输入规则和粘贴规则。
 * Used to mark text as inline code style (`<code>`), with keyboard shortcuts, input rules, and paste rules.
 */
export const InlineCode = Mark.create({
  name: "inlineCode", // 标记名称 / Mark name

  /**
   * Mark 优先级 / Mark priority
   *
   * 高于普通文本样式，避免被其它 mark 覆盖。
   * Higher priority than normal text styles to prevent being overridden by other marks.
   */
  priority: 1000,

  /**
   * 是否可退出标记 / Exitable flag
   */
  exitable: true,

  /**
   * 是否包含边界 / Inclusive flag
   *
   * 当光标位于标记的起始或结束位置时，新输入的字符是否自动继承该标记。
   * Whether newly typed characters at the start or end of the mark automatically inherit the mark.
   */
  inclusive: true,

  /**
   * 排除其他标记 / Excludes other marks
   */
  excludes: "_",

  /**
   * HTML 解析规则 / Parse HTML rules
   */
  parseHTML() {
    return [
      {
        tag: "code",
        /**
         * 获取属性 / Get attributes
         *
         * 如果当前节点父级是 `<pre>`，则忽略该节点（不解析为行内代码）。
         * If the current node's parent is `<pre>`, ignore the node (do not parse as inline code).
         *
         * @param node - DOM 节点 / DOM node
         * @returns 属性对象或 false / Attributes object or false
         */
        getAttrs(node): Record<string, never> | false {
          if (
            node instanceof HTMLElement &&
            node.parentElement?.tagName === "PRE"
          ) {
            return false; // 忽略代码块中的 code / Ignore code inside code blocks
          }
          return {}; // 正常解析 / Normal parsing
        },
      },
    ];
  },

  /**
   * HTML 渲染规则 / Render HTML rules
   *
   * 将标记渲染为 `<code>` 标签，并合并传入的 HTML 属性。
   * Render the mark as `<code>` tag, merging incoming HTML attributes.
   */
  renderHTML({ HTMLAttributes }) {
    return ["code", mergeAttributes(HTMLAttributes), 0];
  },

  /**
   * 命令集合 / Commands
   *
   * 提供切换和移除行内代码的命令。
   * Provide commands to toggle and remove inline code.
   */
  addCommands() {
    return {
      /**
       * 切换行内代码 / Toggle inline code
       *
       * 如果选中文本已应用该标记则移除，否则添加。
       * If the selected text already has this mark, remove it; otherwise, add it.
       *
       * @returns 命令链返回类型 / Command chain return type
       */
      setInlineCode:
        () =>
        ({ commands }): boolean => {
          return commands.toggleMark(this.name);
        },

      /**
       * 移除行内代码 / Unset inline code
       *
       * 强制移除选中文本上的该标记。
       * Forcefully remove this mark from the selected text.
       *
       * @returns 命令链返回类型 / Command chain return type
       */
      unsetInlineCode:
        () =>
        ({ commands }): boolean => {
          return commands.unsetMark(this.name);
        },
    };
  },

  /**
   * 键盘快捷键 / Keyboard shortcuts
   */
  addKeyboardShortcuts() {
    return {
      "Mod-e": (): boolean => {
        return this.editor.commands.setInlineCode();
      },
    };
  },
});

/**
 * 行内代码 schema 扩展 / Inline code schema extension
 *
 * 仅保留 mark schema，命令和快捷键由 InlineCode feature 扩展注册。
 */
export const InlineCodeSchema = InlineCode.extend({
  addKeyboardShortcuts() {
    return {};
  },

  addCommands() {
    return {};
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    inlineCode: {
      /**
       * 设置/切换行内代码 / Set/toggle inline code
       */
      setInlineCode: () => ReturnType;

      /**
       * 移除行内代码 / Remove inline code
       */
      unsetInlineCode: () => ReturnType;
    };
  }
}
