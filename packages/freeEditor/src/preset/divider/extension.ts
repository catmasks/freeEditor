import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 分割线节点 / Divider (horizontal rule) node
 */
export const Divider = Node.create({
  name: "divider",

  group: "block",

  /** 原子节点：无子内容 / Atom node: no child content */
  atom: true,

  /**
   * 默认选项 / Default options
   *
   * @returns 默认选项对象 / Default options object
   */
  addOptions() {
    return {
      HTMLAttributes: {},
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
        tag: "hr",
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
    return ["hr", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  /**
   * 命令集合 / Command collection
   *
   * @returns 命令对象 / Command object
   */
  addCommands() {
    return {
      /**
       * 插入分割线 / Insert divider
       *
       * @returns 命令函数 / Command function
       */
      setDivider:
        () =>
        ({ chain }): boolean => {
          return chain()
            .insertContent([
              {
                type: this.name,
              },
              {
                type: "paragraph",
                content: [],
              },
            ])
            .run();
        },
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
       * Ctrl/Cmd + Shift + H 插入分割线 / Ctrl/Cmd + Shift + H insert divider
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-Shift-h": (): boolean => {
        return this.editor.commands.setDivider();
      },
    };
  },
});

/**
 * 分割线 schema 扩展 / Divider schema extension
 *
 * 仅保留 node schema，命令和快捷键由 Divider feature 扩展注册。
 */
export const DividerSchema = Divider.extend({
  addKeyboardShortcuts() {
    return {};
  },

  addCommands() {
    return {};
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    divider: {
      /**
       * 插入分割线 / Insert divider
       *
       * @returns 返回值类型 / Return type
       */
      setDivider: () => ReturnType;
    };
  }
}
