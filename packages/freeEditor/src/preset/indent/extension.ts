import { Extension } from "@tiptap/core";

/**
 * 最大缩进级别（每级 2em，即首行缩进 2 字符）
 * Maximum indent level (2em per level, i.e. 2 characters first-line indent)
 */
const MAX_INDENT_LEVEL = 5;

/**
 * 遍历选区或光标所在块节点并执行缩进修改
 * Iterate selected (or cursor) block nodes and apply indent mutation
 *
 * @param state 编辑器状态 / Editor state
 * @param tr 事务 / Transaction
 * @param mutate 修改函数：接收当前级别，返回新级别 / Mutation function: receives current level, returns new level
 * @returns 是否发生了实际变化 / Whether actual change happened
 */
function mutateIndent(
  state: any,
  tr: any,
  mutate: (currentLevel: number) => number,
): boolean {
  const { selection, doc } = state;
  const { $from, $to } = selection;
  const targetTypes = ["paragraph", "heading"];
  let changed = false;

  // 遍历选区（含空选区光标位置）范围内的块节点
  // Iterate block nodes within selection (including cursor position for empty selection)
  doc.nodesBetween($from.pos, $to.pos, (node: any, pos: number) => {
    if (targetTypes.includes(node.type.name)) {
      const currentLevel = node.attrs.indent || 0;
      const newLevel = Math.max(
        0,
        Math.min(mutate(currentLevel), MAX_INDENT_LEVEL),
      );
      if (newLevel !== currentLevel) {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent: newLevel });
        changed = true;
      }
    }
  });

  return changed;
}

/**
 * 缩进扩展 / Indent extension
 *
 * 为段落和标题节点增加 text-indent 首行缩进属性，每级固定 2em（2 字符）
 * Adds text-indent (first-line indent) attribute to paragraph and heading nodes, fixed 2em per level
 */
export const Indent = Extension.create({
  name: "indent",

  /**
   * 添加全局属性 / Add global attributes
   *
   * @returns 全局属性配置 / Global attributes configuration
   */
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],

        attributes: {
          indent: {
            default: 0,

            /**
             * 解析 HTML 属性 / Parse HTML attribute
             *
             * 从 text-indent 换算缩进级别（每级 2em）
             *
             * @param element DOM 元素 / DOM element
             * @returns 缩进级别（0 ~ 5） / Indent level (0 ~ 5)
             */
            parseHTML: (element) => {
              const em = parseFloat(element.style.textIndent) || 0;
              return Math.max(
                0,
                Math.min(Math.round(em / 2), MAX_INDENT_LEVEL),
              );
            },

            /**
             * 渲染 HTML 属性 / Render HTML attribute
             *
             * 直接输出 text-indent: N×2em
             *
             * @param attributes 节点属性 / Node attributes
             * @returns HTML 属性对象 / HTML attribute object
             */
            renderHTML: (attributes) => {
              if (!attributes.indent || attributes.indent <= 0) return {};
              return { style: `text-indent: ${attributes.indent * 2}em` };
            },
          },
        },
      },
    ];
  },

  /**
   * 添加命令 / Add commands
   *
   * @returns 命令对象 / Command object
   */
  addCommands() {
    return {
      /**
       * 增加缩进（每级 2em） / Increase indent (2em per level)
       *
       * @param levels 增加的级别数 / Number of levels to increase
       * @returns 命令函数 / Command function
       */
      setIndent:
        (levels: number = 1) =>
        ({ tr, state, dispatch }) => {
          const changed = mutateIndent(state, tr, (l) => l + levels);
          if (changed && dispatch) dispatch(tr);
          return changed;
        },

      /**
       * 减少缩进 / Decrease indent
       *
       * @param levels 减少的级别数 / Number of levels to decrease
       * @returns 命令函数 / Command function
       */
      setOutdent:
        (levels: number = 1) =>
        ({ tr, state, dispatch }) => {
          const changed = mutateIndent(state, tr, (l) => l - levels);
          if (changed && dispatch) dispatch(tr);
          return changed;
        },

      /**
       * 清除缩进 / Clear indent
       *
       * @returns 命令函数 / Command function
       */
      unsetIndent:
        () =>
        ({ tr, state, dispatch }) => {
          const changed = mutateIndent(state, tr, () => 0);
          if (changed && dispatch) dispatch(tr);
          return changed;
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
      /** Tab 增加缩进 */
      Tab: () => this.editor.commands.setIndent(),
      /** Shift + Tab 减少缩进 */
      "Shift-Tab": () => this.editor.commands.setOutdent(),
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      /**
       * 增加缩进（每级 2em） / Increase indent (2em per level)
       *
       * @param levels 增加的级别数 / Number of levels to increase
       */
      setIndent: (levels?: number) => ReturnType;
      /**
       * 减少缩进 / Decrease indent
       *
       * @param levels 减少的级别数 / Number of levels to decrease
       */
      setOutdent: (levels?: number) => ReturnType;
      /** 清除缩进 / Clear indent */
      unsetIndent: () => ReturnType;
    };
  }
}
