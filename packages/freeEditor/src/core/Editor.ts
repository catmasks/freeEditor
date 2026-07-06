import { Editor as TiptapEditor } from "@tiptap/core";
import type { EditorConfig } from "./types/index";

/**
 * 编辑器核心类 / Editor core class
 */
export class CoreEditor {
  /**
   * Tiptap 编辑器实例 / Tiptap editor instance
   */
  editor: TiptapEditor;

  /**
   * 构造函数 / Constructor
   * @param el 挂载元素 / Mount element
   * @param options 编辑器配置 / Editor configuration
   */
  constructor(el: HTMLElement, options: EditorConfig) {
    this.editor = new TiptapEditor({
      element: el,
      content: options.content || "",
      extensions: options.extensions || [],
      editorProps: options.editorProps || {},
    });
  }

  /**
   * 获取 HTML 内容 / Get HTML content
   * @returns HTML 字符串 / HTML string
   */
  getHtml() {
    return this.editor.getHTML();
  }

  /**
   * 销毁编辑器实例 / Destroy editor instance
   */
  destroy() {
    this.editor.destroy();
  }
}
