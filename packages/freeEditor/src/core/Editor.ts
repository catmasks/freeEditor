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
   * 当前禁用状态 / Current disabled state
   */
  private isDisabled = false;

  /**
   * 当前只读状态 / Current readonly state
   */
  private isReadonly = false;

  /**
   * 构造函数 / Constructor
   * @param el 挂载元素 / Mount element
   * @param options 编辑器配置 / Editor configuration
   */
  constructor(el: HTMLDivElement, options: EditorConfig) {
    if (!el) {
      throw new Error(
        "DOM element is required, please pass a valid HTMLDivElement element.",
      );
    }

    this.editor = new TiptapEditor({
      element: el,
      content: options.content || "",
      extensions: options.extensions || [],
      editorProps: options.editorProps || {},
    });
  }

  /**
   * 获取是否禁用 / Get whether disabled
   * @returns 是否禁用 / Whether disabled
   */
  get disabled(): boolean {
    return this.isDisabled;
  }

  /**
   * 获取是否只读 / Get whether readonly
   * @returns 是否只读 / Whether readonly
   */
  get readonly(): boolean {
    return this.isReadonly;
  }

  /**
   * 设置禁用状态 / Set disabled state
   * @param disabled 是否禁用 / Whether disabled
   */
  setDisabled(disabled: boolean): void {
    this.isDisabled = disabled;
    this.updateEditable();
  }

  /**
   * 设置只读状态 / Set readonly state
   * @param readonly 是否只读 / Whether readonly
   */
  setReadonly(readonly: boolean): void {
    this.isReadonly = readonly;
    this.updateEditable();
  }

  /**
   * 更新编辑器可编辑状态 / Update editor editable state
   * 禁用或只读时都不可编辑
   * 采用多层级策略确保生效：
   * 调用 Tiptap 官方 setEditable API
   * 直接设置 DOM 的 contenteditable 属性（兜底方案）
   */
  private updateEditable(): void {
    const editable = !(this.isDisabled || this.isReadonly);

    /** 调用官方 API 设置可编辑状态 */
    this.editor.setEditable(editable);

    /**兜底：直接操作 DOM 设置 contenteditable，确保对所有浏览器生效 */
    const dom = this.editor.view?.dom as HTMLElement | null | undefined;
    if (dom && dom.setAttribute) {
      const value = editable ? "true" : "false";
      dom.setAttribute("contenteditable", value);
      /** 兼容非标准属性访问 */
      try {
        dom.contentEditable = value;
      } catch (_e) {
        /* 忽略 */
      }
    }
  }

  /**
   * 获取 HTML 内容 / Get HTML content
   * @returns HTML 字符串 / HTML string
   */
  getHtml(): string {
    return this.editor.getHTML();
  }
  /**
   * 设置编辑器内容 / Set editor content
   * @param html - HTML 字符串 / HTML string
   */
  setHtml(html?: string): void {
    this.editor.commands.setContent(html ?? "", { emitUpdate: true });
  }
  /**
   * 获取 JSON 内容 / Get JSON content
   * @returns JSON 字符串 / JSON string
   */
  getJson(): Record<string, unknown> {
    return this.editor.getJSON();
  }
  /**
   * 销毁编辑器实例 / Destroy editor instance
   */
  destroy(): void {
    this.editor.destroy();
  }
}
