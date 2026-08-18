import { Extension } from "@tiptap/core";
import { history, undo, redo } from "@tiptap/pm/history";

/**
 * 历史记录扩展 / History extension
 *
 * 提供撤销(undo)和重做(redo)命令，并注册 prosemirror-history。
 * 不在此处注册快捷键，快捷键由 UndoShortcut 扩展控制。
 */
export const History = Extension.create({
  /** 扩展名称 / Extension name */
  name: "history",

  /** 配置选项 / Options */
  addOptions() {
    return {
      /** 历史记录深度 / History depth */
      depth: 100,
      /** 新步骤分组延迟（毫秒）/ New step group delay (ms) */
      newGroupDelay: 200,
    };
  },

  /** 添加命令 / Add commands */
  addCommands() {
    return {
      /**
       * 撤销 / Undo
       * @returns 命令是否执行成功 / Whether the command was executed successfully
       */
      undo:
        () =>
        ({ state, dispatch }): boolean => {
          return undo(state, dispatch);
        },

      /**
       * 重做 / Redo
       * @returns 命令是否执行成功 / Whether the command was executed successfully
       */
      redo:
        () =>
        ({ state, dispatch }): boolean => {
          return redo(state, dispatch);
        },
    };
  },

  /** 添加 ProseMirror 插件 / Add ProseMirror plugins */
  addProseMirrorPlugins() {
    return [
      history({
        depth: this.options.depth,
        newGroupDelay: this.options.newGroupDelay,
      }),
    ];
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    history: {
      /**
       * 撤销 / Undo
       */
      undo: () => ReturnType;
      /**
       * 重做 / Redo
       */
      redo: () => ReturnType;
    };
  }
}
