import { Node, mergeAttributes } from "@tiptap/core";

/**
 * 任务列表节点 / Task list node
 *
 * 包含可复选的任务项列表 / Contains checkable task item list
 */
export const TaskList = Node.create({
  name: "taskList",

  group: "block list",

  content: "taskItem+",

  /**
   * 默认选项 / Default options
   *
   * @returns 默认选项对象 / Default options object
   */
  addOptions() {
    return {
      HTMLAttributes: {},

      /**
       * 优先级（用于节点创建时的优先级比较）
       * Priority (used for priority comparison during node creation)
       */
      priority: 1000,
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
        tag: 'ul[data-type="taskList"]',
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
      "ul",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "taskList",
      }),
      0,
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
       * 设置任务列表 / Wrap in task list
       *
       * @returns 命令函数 / Command function
       */
      setTaskList:
        () =>
        ({ commands }): boolean => {
          return commands.wrapInList(this.name);
        },

      /**
       * 取消任务列表 / Unwrap from task list
       *
       * @returns 命令函数 / Command function
       */
      unsetTaskList:
        () =>
        ({ commands }): boolean => {
          return commands.liftListItem("taskItem");
        },

      /**
       * 切换任务列表 / Toggle task list
       *
       * 已是任务列表时自动取消 / Automatically toggles off when already a task list
       *
       * @returns 命令函数 / Command function
       */
      toggleTaskList:
        () =>
        ({ chain, editor }): boolean => {
          const isActive = editor.isActive(this.name);
          if (isActive) {
            // 任务列表 → 段落 / Task list → paragraph
            return chain().focus().liftListItem("taskItem").run();
          }
          if (editor.isActive("orderedList")) {
            // 有序列表 → 任务列表 / Ordered list → task list
            return chain()
              .focus()
              .liftListItem("listItem")
              .wrapInList(this.name)
              .run();
          }
          if (editor.isActive("bulletList")) {
            // 无序列表 → 任务列表 / Bullet list → task list
            return chain()
              .focus()
              .liftListItem("listItem")
              .wrapInList(this.name)
              .run();
          }
          // 段落 → 任务列表 / Paragraph → task list
          return chain().focus().wrapInList(this.name).run();
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
       * Ctrl/Cmd + Shift + 9 切换任务列表 / Ctrl/Cmd + Shift + 9 toggle task list
       *
       * @returns 是否处理了快捷键 / Whether the shortcut was handled
       */
      "Mod-Shift-9": (): boolean => {
        return this.editor.commands.toggleTaskList();
      },
    };
  },
});

/**
 * 任务列表 schema 扩展 / Task list schema extension
 *
 * 仅保留 node schema，命令和快捷键由 TaskList feature 扩展注册。
 */
export const TaskListSchema = TaskList.extend({
  addKeyboardShortcuts() {
    return {};
  },

  addCommands() {
    return {};
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    taskList: {
      /**
       * 设置任务列表 / Wrap in task list
       *
       * @returns 返回值类型 / Return type
       */
      setTaskList: () => ReturnType;

      /**
       * 取消任务列表 / Unwrap from task list
       *
       * @returns 返回值类型 / Return type
       */
      unsetTaskList: () => ReturnType;

      /**
       * 切换任务列表 / Toggle task list
       *
       * 已是任务列表时自动取消 / Automatically toggles off when already a task list
       *
       * @returns 返回值类型 / Return type
       */
      toggleTaskList: () => ReturnType;
    };
  }
}
