/**
 * 媒体拖拽粘贴处理器类型 / Media drop handler type
 */
type MediaDropHandler = (files: File[], event: DragEvent) => void;

/**
 * 媒体粘贴处理器类型 / Media paste handler type
 */
type MediaPasteHandler = (files: File[], event: ClipboardEvent) => void;

/**
 * 媒体引擎类 / Media engine class
 * @description 处理拖拽释放和粘贴的媒体文件接管 / Handles drag-and-drop and paste media file takeover
 */
export class MediaEngine {
  /**
   * 根容器元素 / Root container element
   */
  private root: HTMLElement;

  /**
   * 是否已绑定事件 / Whether events are bound
   */
  private bound = false;

  /**
   * 拖拽释放处理器集合 / Drop handlers set
   */
  private dropHandlers = new Set<MediaDropHandler>();

  /**
   * 粘贴处理器集合 / Paste handlers set
   */
  private pasteHandlers = new Set<MediaPasteHandler>();

  /**
   * 拖拽悬停事件处理函数 / Drag over event handler
   */
  private onDragOver!: (e: DragEvent) => void;

  /**
   * 拖拽释放事件处理函数 / Drop event handler
   */
  private onDropEvent!: (e: DragEvent) => void;

  /**
   * 粘贴事件处理函数 / Paste event handler
   */
  private onPasteEvent!: (e: ClipboardEvent) => void;

  /**
   * 构造函数 / Constructor
   * @param root 根容器元素 / Root container element
   */
  constructor(root: HTMLElement) {
    this.root = root;

    this.bind();
  }

  /**
   * 注册拖拽释放处理器 / Register drop handler
   * @param handler 处理函数 / Handler function
   * @returns 取消注册函数 / Unregister function
   */
  onDrop(handler: MediaDropHandler) {
    this.dropHandlers.add(handler);

    return () => {
      this.dropHandlers.delete(handler);
    };
  }

  /**
   * 注册粘贴处理器 / Register paste handler
   * @param handler 处理函数 / Handler function
   * @returns 取消注册函数 / Unregister function
   */
  onPaste(handler: MediaPasteHandler) {
    this.pasteHandlers.add(handler);

    return () => {
      this.pasteHandlers.delete(handler);
    };
  }

  /**
   * 绑定事件 / Bind events
   */
  private bind() {
    if (this.bound) return;

    this.bound = true;

    this.onDragOver = (e: DragEvent) => {
      e.preventDefault();

      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    };

    this.onDropEvent = (e: DragEvent) => {
      const files = Array.from(e.dataTransfer?.files || []);

      if (!files.length) {
        return;
      }

      this.dropHandlers.forEach((handler) => {
        handler(files, e);
      });

      e.preventDefault();
      e.stopPropagation();
    };

    this.onPasteEvent = (e: ClipboardEvent) => {
      const dt = e.clipboardData;

      if (!dt) {
        return;
      }

      const map = new Map<string, File>();

      for (const file of Array.from(dt.files || [])) {
        map.set(file.name + file.size, file);
      }

      for (const item of Array.from(dt.items || [])) {
        const file = item.getAsFile?.();

        if (file) {
          map.set(file.name + file.size, file);
        }
      }

      const files = [...map.values()];

      if (!files.length) {
        return;
      }

      this.pasteHandlers.forEach((handler) => {
        handler(files, e);
      });

      e.preventDefault();
      e.stopPropagation();
    };

    this.root.addEventListener("dragover", this.onDragOver, true);

    this.root.addEventListener("drop", this.onDropEvent, true);

    this.root.addEventListener("paste", this.onPasteEvent, true);
  }

  /**
   * 解绑事件并销毁 / Unbind events and destroy
   */
  destroy() {
    if (!this.bound) return;

    this.root.removeEventListener("dragover", this.onDragOver, true);

    this.root.removeEventListener("drop", this.onDropEvent, true);

    this.root.removeEventListener("paste", this.onPasteEvent, true);

    this.dropHandlers.clear();

    this.pasteHandlers.clear();

    this.bound = false;
  }
}
