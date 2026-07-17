import type { MediaType } from "../types";

/**
 * 媒体拖拽粘贴处理器类型 / Media drop handler type
 */
type MediaDropHandler = (files: File[], event: DragEvent) => void;

/**
 * 媒体粘贴处理器类型 / Media paste handler type
 */
type MediaPasteHandler = (files: File[], event: ClipboardEvent) => void;

/**
 * 带类型过滤的处理器 / Handler with type filter
 */
interface TypedHandler<T> {
  /**
   * 处理的媒体类型 / Media type to handle
   */
  type: MediaType;

  /**
   * 处理函数 / Handler function
   */
  handler: T;
}

/**
 * 判断文件的媒体类型 / Determine media type of a file
 * @param file 文件对象 / File object
 * @returns 媒体类型 / Media type
 */
function getMediaType(file: File): MediaType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "attachment";
}

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
   * 拖拽释放处理器集合（按类型过滤） / Drop handlers set (filtered by type)
   */
  private dropHandlers: TypedHandler<MediaDropHandler>[] = [];

  /**
   * 粘贴处理器集合（按类型过滤） / Paste handlers set (filtered by type)
   */
  private pasteHandlers: TypedHandler<MediaPasteHandler>[] = [];

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
   * @param type 处理的媒体类型 / Media type to handle
   * @param handler 处理函数 / Handler function
   * @returns 取消注册函数 / Unregister function
   */
  onDrop(type: MediaType, handler: MediaDropHandler): () => void;
  /**
   * 注册拖拽释放处理器（处理所有类型，兼容旧版） / Register drop handler (handle all types, for backward compatibility)
   * @param handler 处理函数 / Handler function
   * @returns 取消注册函数 / Unregister function
   * @deprecated 请使用 onDrop(type, handler) 重载 / Please use onDrop(type, handler) overload
   */
  onDrop(handler: MediaDropHandler): () => void;
  onDrop(
    typeOrHandler: MediaType | MediaDropHandler,
    handler?: MediaDropHandler,
  ): () => void {
    let type: MediaType = "attachment";
    let fn: MediaDropHandler;

    if (typeof typeOrHandler === "function") {
      fn = typeOrHandler;
      type = "attachment";
    } else {
      type = typeOrHandler;
      fn = handler!;
    }

    const item: TypedHandler<MediaDropHandler> = { type, handler: fn };
    this.dropHandlers.push(item);

    return () => {
      const index = this.dropHandlers.indexOf(item);
      if (index > -1) {
        this.dropHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 注册粘贴处理器 / Register paste handler
   * @param type 处理的媒体类型 / Media type to handle
   * @param handler 处理函数 / Handler function
   * @returns 取消注册函数 / Unregister function
   */
  onPaste(type: MediaType, handler: MediaPasteHandler): () => void;
  /**
   * 注册粘贴处理器（处理所有类型，兼容旧版） / Register paste handler (handle all types, for backward compatibility)
   * @param handler 处理函数 / Handler function
   * @returns 取消注册函数 / Unregister function
   * @deprecated 请使用 onPaste(type, handler) 重载 / Please use onPaste(type, handler) overload
   */
  onPaste(handler: MediaPasteHandler): () => void;
  onPaste(
    typeOrHandler: MediaType | MediaPasteHandler,
    handler?: MediaPasteHandler,
  ): () => void {
    let type: MediaType = "attachment";
    let fn: MediaPasteHandler;

    if (typeof typeOrHandler === "function") {
      fn = typeOrHandler;
      type = "attachment";
    } else {
      type = typeOrHandler;
      fn = handler!;
    }

    const item: TypedHandler<MediaPasteHandler> = { type, handler: fn };
    this.pasteHandlers.push(item);

    return () => {
      const index = this.pasteHandlers.indexOf(item);
      if (index > -1) {
        this.pasteHandlers.splice(index, 1);
      }
    };
  }

  /**
   * 分发给定文件到对应类型的处理器 / Dispatch files to handlers of corresponding type
   * @param files 文件列表 / File list
   * @param handlers 处理器列表 / Handler list
   * @param event 事件对象 / Event object
   */
  private dispatchFiles<T extends Function>(
    files: File[],
    handlers: TypedHandler<T>[],
    event: DragEvent | ClipboardEvent,
  ) {
    const typePriority: MediaType[] = ["image", "video", "attachment"];

    const remainingFiles = [...files];

    for (const type of typePriority) {
      if (remainingFiles.length === 0) break;

      const typeHandlers = handlers.filter((h) => h.type === type);
      if (typeHandlers.length === 0) continue;

      const filesOfType = remainingFiles.filter(
        (f) => getMediaType(f) === type,
      );
      if (filesOfType.length === 0) continue;

      for (const h of typeHandlers) {
        (h.handler as any)(filesOfType, event);
      }

      const remainingSet = new Set(remainingFiles);
      for (const f of filesOfType) {
        remainingSet.delete(f);
      }
      remainingFiles.length = 0;
      remainingFiles.push(...remainingSet);
    }
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

      this.dispatchFiles(files, this.dropHandlers, e);

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

      this.dispatchFiles(files, this.pasteHandlers, e);

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

    this.dropHandlers = [];

    this.pasteHandlers = [];

    this.bound = false;
  }
}
