import { Node } from "@tiptap/core";

/**
 * 软换行节点 / Line break (hard break) node
 *
 * 在同一段落内插入 &lt;br&gt; 进行换行，不创建新段落。
 * 常用于需要在段落内强制换行但保持语义上仍属于同一段落的场景。
 *
 * Inserts &lt;br&gt; within the same paragraph for a line break without
 * creating a new paragraph block. Useful for forcing a visual line break
 * while keeping content semantically in the same paragraph.
 */
export const LineBreak = Node.create({
  name: "lineBreak",

  group: "inline",

  /** 原子节点：无子内容 / Atom node: no child content */
  atom: true,

  /** 行内无宽度 / Inline with no width */
  inline: true,

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "br",
      },
    ];
  },

  /**
   * 渲染 HTML / Render HTML
   *
   * @returns HTML 渲染描述 / HTML render description
   */
  renderHTML() {
    return ["br"];
  },

  /**
   * 纯文本表示 / Plain text representation
   *
   * @returns 换行符字符串 / Newline character string
   */
  renderText() {
    return "\n";
  },

  /**
   * 添加命令 / Add commands
   *
   * @returns 命令对象 / Command object
   */
  addCommands() {
    return {
      /**
       * 在光标位置插入软换行 / Insert line break at cursor position
       *
       * 在当前段落内插入 &lt;br&gt;，光标移到下一行。
       * 不会创建新的段落节点。
       *
       * Inserts &lt;br&gt; inside current paragraph and moves cursor to next line.
       * Does NOT create a new paragraph node.
       *
       * @returns 命令函数 / Command function
       */
      setLineBreak:
        () =>
        ({ chain, state }) => {
          const { selection } = state;
          const { $from } = selection;

          // 在代码块中不插入软换行（代码块通常使用 Enter 本身换行）
          // Don't insert line break inside code blocks (they usually handle Enter directly)
          const inCodeBlock = $from.node($from.depth).type.name === "codeBlock";
          if (inCodeBlock) {
            return false;
          }

          return chain()
            .insertContent([
              {
                type: this.name,
              },
            ])
            .run();
        },
    };
  },

  /**
   * 添加键盘快捷键 / Add keyboard shortcuts
   *
   * @returns 快捷键映射对象 / Keyboard shortcut mapping object
   */
  addKeyboardShortcuts() {
    return {
      /**
       * Shift + Enter 插入软换行 / Shift + Enter insert line break
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Shift-Enter": () => {
        return this.editor.commands.setLineBreak();
      },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    lineBreak: {
      /**
       * 在光标位置插入软换行 / Insert line break at cursor position
       *
       * 在当前段落内插入 &lt;br&gt;，光标移到下一行。
       * 不会创建新的段落节点。
       *
       * Inserts &lt;br&gt; inside current paragraph and moves cursor to next line.
       * Does NOT create a new paragraph node.
       */
      setLineBreak: () => ReturnType;
    };
  }
}
