import { i18n } from "../../i18n/index";
import type { MediaNodeAttrs } from "./types";
import { editorRuntimeState } from "../../editorRuntimeState";
import {
  createActionButton,
  subscribeI18n,
  updateProgressText,
} from "../uploadNode/mediaNodeViewShared";

/**
 * 当前全屏预览的清理函数（模块级单例，避免多个预览叠加）
 * Cleanup function of the currently active fullscreen preview (module-level singleton)
 */
let cleanupActivePreview: (() => void) | null = null;

/**
 * 打开图片全屏预览
 * Open an image in fullscreen preview
 * @param src 图片地址 / Image source URL
 */
function previewImage(src: string): void {
  if (!src) {
    return;
  }

  // 关闭先前打开的预览，避免多个节点同时预览叠加
  cleanupActivePreview?.();

  const overlay = document.createElement("div");

  overlay.className = "free-editor__image-preview";

  const image = document.createElement("img");

  image.src = src;

  image.alt = "";

  overlay.appendChild(image);

  document.body.appendChild(overlay);

  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      close();
    }
  };

  const close = (): void => {
    overlay.remove();

    document.removeEventListener("keydown", onKeydown);

    if (cleanupActivePreview === close) {
      cleanupActivePreview = null;
    }
  };

  overlay.addEventListener("click", close);

  document.addEventListener("keydown", onKeydown);

  cleanupActivePreview = close;
}

/**
 * 调整大小手柄方向 / Resize handle direction
 */
type HandleDirection =
  | "free-editor__top-left"
  | "free-editor__top"
  | "free-editor__top-right"
  | "free-editor__right"
  | "free-editor__bottom-right"
  | "free-editor__bottom"
  | "free-editor__bottom-left"
  | "free-editor__left";

/**
 * 媒体节点选项 / Media node options
 */
interface MediaNodeOptions {
  /**
   * 容器元素 / Container element
   */
  container: HTMLElement;

  /**
   * 节点属性 / Node attributes
   */
  attrs: MediaNodeAttrs;

  /**
   * 是否选中 / Whether selected
   */
  selected: boolean;

  /**
   * 更新属性 / Update attributes
   * @param attrs 部分属性 / Partial attributes
   */
  updateAttributes: (attrs: Partial<MediaNodeAttrs>) => void;

  /**
   * 删除节点 / Delete node
   */
  deleteNode: () => void;

  /**
   * 上传器 / Uploader
   */
  uploader?: {
    /**
     * 取消上传 / Cancel upload
     * @param id 任务 ID / Task ID
     */
    cancel: (id: string) => void;

    /**
     * 重试上传 / Retry upload
     * @param id 任务 ID / Task ID
     */
    retry: (id: string) => void;
  };
}

/**
 * 媒体节点视图类 / Media node view class
 */
export class MediaNodeView {
  /**
   * 节点选项 / Node options
   */
  private options: MediaNodeOptions;

  /**
   * 根元素 / Root element
   */
  private el!: HTMLSpanElement;

  /**
   * 包装器元素 / Wrapper element
   */
  private wrapper!: HTMLSpanElement;

  /**
   * 起始 X 坐标 / Start X coordinate
   */
  private startX = 0;

  /**
   * 起始宽度 / Start width
   */
  private startWidth = 0;

  /**
   * 当前调整手柄 / Current resize handle
   */
  private currentHandle: HandleDirection = "free-editor__bottom-right";

  /**
   * 调整大小临时宽度 / Resize temporary width
   */
  private resizeWidth = "";

  /**
   * 取消语言变化订阅 / Unsubscribe locale change
   */
  private unsubscribeLocale: (() => void) | null = null;

  /**
   * 是否可调整大小（禁用/只读/插件被排除时不可调整）
   * Whether resizable (not resizable when disabled, readonly, or plugin excluded)
   */
  private get isResizable(): boolean {
    if (editorRuntimeState.disabled || editorRuntimeState.readonly) {
      return false;
    }

    const pluginKey = this.options.attrs.type;
    if (pluginKey && editorRuntimeState.activePluginKeys) {
      return editorRuntimeState.activePluginKeys.has(pluginKey);
    }

    return true;
  }

  /**
   * 是否可点击图片预览（禁用/只读状态）
   * Whether clicking an image opens the fullscreen preview (disabled/readonly)
   */
  private get canPreviewImage(): boolean {
    return editorRuntimeState.disabled || editorRuntimeState.readonly;
  }

  /**
   * 构造函数 / Constructor
   * @param options 媒体节点选项 / Media node options
   */
  constructor(options: MediaNodeOptions) {
    this.options = options;

    this.render();

    // [I18N] 订阅语言变化
    this.unsubscribeLocale = subscribeI18n(() => {
      this.refreshLocale();
    });
  }

  /**
   * 刷新语言（语言切换时重新渲染内容） / Refresh locale (re-render content on locale change)
   */
  private refreshLocale(): void {
    const { attrs } = this.options;

    this.wrapper.innerHTML = "";

    if (attrs.loading) {
      this.renderLoading();
    } else if (attrs.error) {
      this.renderError();
    } else {
      this.renderMedia();

      const isAttachment = attrs.type === "attachment";
      if (!isAttachment && this.isResizable) {
        this.renderResizeHandles();
      }
    }

    if (this.options.selected) {
      this.wrapper.classList.add("free-editor__selected");
    }
  }

  /**
   * 渲染节点视图 / Render node view
   */
  private render(): void {
    const { attrs } = this.options;

    this.el = document.createElement("span");

    this.el.className = "free-editor__media-node";

    this.wrapper = document.createElement("span");

    this.wrapper.className = "free-editor__media-resizer";

    this.wrapper.dataset.type = attrs.type || "image";

    this.applyWrapperStyle();

    if (attrs.loading) {
      this.renderLoading();
    } else if (attrs.error) {
      this.renderError();
    } else {
      this.renderMedia();

      const isAttachment = attrs.type === "attachment";
      if (!isAttachment && this.isResizable) {
        this.renderResizeHandles();
      }
    }

    this.el.appendChild(this.wrapper);

    this.options.container.appendChild(this.el);

    if (this.options.selected) {
      this.wrapper.classList.add("free-editor__selected");
    }
  }

  /**
   * 应用包装器样式 / Apply wrapper style
   */
  private applyWrapperStyle(): void {
    const { attrs } = this.options;

    const isAttachment = attrs.type === "attachment";

    if (isAttachment) {
      this.wrapper.style.display = "inline";
      this.wrapper.style.verticalAlign = "baseline";
      this.wrapper.style.lineHeight = "inherit";
      this.wrapper.style.width = "auto";
      this.wrapper.style.maxWidth = "none";
      this.wrapper.style.position = "static";
    } else {
      this.wrapper.style.display = "inline-block";
      this.wrapper.style.maxWidth = "100%";
      this.wrapper.style.verticalAlign = "middle";
      this.wrapper.style.lineHeight = "0";
      this.wrapper.style.width = attrs.width || "100%";
      this.wrapper.style.position = "relative";
    }
  }

  /**
   * 渲染加载状态 / Render loading state
   */
  private renderLoading(): void {
    const { attrs, uploader } = this.options;

    const box = document.createElement("span");

    box.className = "free-editor__media-loading";

    const spinner = document.createElement("span");

    spinner.className = "free-editor__spinner";

    const progress = document.createElement("span");

    progress.className = "free-editor__progress";

    progress.textContent = `${attrs.progress || 0}%`;

    const cancel = createActionButton("cancel", () => {
      if (attrs.id) {
        uploader?.cancel(attrs.id);
      }

      this.options.deleteNode();
    });

    if (attrs.type != "attachment") {
      cancel.style.marginTop = "8px";
    }

    box.appendChild(spinner);

    box.appendChild(progress);

    box.appendChild(cancel);

    this.wrapper.appendChild(box);
  }

  /**
   * 渲染错误状态 / Render error state
   */
  private renderError(): void {
    const { attrs, uploader } = this.options;

    const box = document.createElement("span");

    box.className = "free-editor__media-error";

    box.textContent = i18n.t("media.uploadFailed");

    const toolbar = document.createElement("div");

    toolbar.style.display = "flex";

    toolbar.style.alignItems = "center";

    toolbar.style.gap = "6px";

    toolbar.style.marginTop = "8px";

    const retry = createActionButton("retry", () => {
      if (attrs.id) {
        uploader?.retry(attrs.id);
      }
    });

    const remove = createActionButton("remove", () => {
      this.options.deleteNode();
    });

    toolbar.appendChild(retry);

    toolbar.appendChild(remove);

    box.appendChild(toolbar);

    this.wrapper.appendChild(box);
  }

  /**
   * 渲染媒体内容 / Render media content
   */
  private renderMedia(): void {
    const { attrs } = this.options;

    const isVideo = attrs.type === "video";
    const isAttachment = attrs.type === "attachment";

    const mediaWrap = document.createElement("span");

    mediaWrap.className = "free-editor__media-inner";

    mediaWrap.style.position = "relative";

    if (isAttachment) {
      mediaWrap.style.display = "inline";
    } else {
      mediaWrap.style.display = "block";
    }

    if (isAttachment) {
      this.renderAttachment(mediaWrap);
      return;
    }

    if (isVideo) {
      const media = document.createElement("video");

      media.src = attrs.src || "";

      media.draggable = false;

      media.contentEditable = "false";

      media.controls = this.options.selected;

      media.preload = "metadata";

      media.style.width = "100%";

      media.style.maxWidth = "100%";

      media.style.display = "block";

      media.style.borderRadius = "4px";

      media.style.background = "#000";

      media.addEventListener("mousedown", (e) => {
        if (this.options.selected) {
          return;
        }

        e.preventDefault();

        e.stopPropagation();

        this.wrapper.dispatchEvent(
          new MouseEvent("mousedown", {
            bubbles: true,
            cancelable: true,
            clientX: e.clientX,
            clientY: e.clientY,
          }),
        );
      });

      media.addEventListener("dblclick", (e) => {
        e.preventDefault();

        e.stopPropagation();

        if (media.paused) {
          void media.play();
        } else {
          media.pause();
        }
      });

      media.addEventListener("click", (e) => {
        if (!this.options.selected) {
          e.preventDefault();

          e.stopPropagation();
        }
      });

      mediaWrap.appendChild(media);

      const playIcon = document.createElement("span");

      playIcon.className = "free-editor__video-play-icon";

      playIcon.innerHTML = `
    <svg
      viewBox="0 0 24 24"
      width="60%"
      height="60%"
      fill="white"
    >
      <path d="M8 5v14l11-7z"></path>
    </svg>
  `;

      playIcon.style.position = "absolute";

      playIcon.style.left = "50%";

      playIcon.style.top = "50%";

      playIcon.style.transform = "translate(-50%, -50%)";
      playIcon.style.aspectRatio = "1 / 1";
      playIcon.style.width = "18%";
      playIcon.style.minWidth = "28px";
      playIcon.style.maxWidth = "96px";
      playIcon.style.borderRadius = "50%";

      playIcon.style.display = "flex";

      playIcon.style.alignItems = "center";

      playIcon.style.justifyContent = "center";

      playIcon.style.background = "rgba(0,0,0,0.45)";

      playIcon.style.backdropFilter = "blur(4px)";

      playIcon.style.pointerEvents = "none";

      playIcon.style.transition = "opacity 0.2s ease";

      playIcon.style.zIndex = "2";

      playIcon.style.opacity = this.options.selected ? "0" : "1";

      mediaWrap.appendChild(playIcon);

      this.wrapper.appendChild(mediaWrap);

      return;
    }

    const media = document.createElement("img");

    media.src = attrs.src || "";

    media.draggable = false;

    media.contentEditable = "false";

    media.style.width = "100%";

    media.style.maxWidth = "100%";

    media.style.display = "block";

    media.style.borderRadius = "4px";

    media.addEventListener("click", (e) => {
      // 仅在禁用/只读状态点击时打开全屏预览
      if (!this.canPreviewImage) {
        return;
      }

      e.preventDefault();

      e.stopPropagation();

      previewImage(attrs.src || "");
    });

    mediaWrap.appendChild(media);

    this.wrapper.appendChild(mediaWrap);
  }

  /**
   * 渲染附件文件卡片 / Render attachment file card
   * @param mediaWrap 媒体包装器元素 / Media wrapper element
   */
  private renderAttachment(mediaWrap: HTMLSpanElement): void {
    const { attrs } = this.options;

    const link = document.createElement("a");
    link.className = "free-editor__attachment-link";
    link.href = attrs.src || "#";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = attrs.name || "";
    link.textContent = `${attrs.name || i18n.t("attachment.defaultName")}`;
    link.style.pointerEvents = "none";
    link.addEventListener("mouseenter", () => {
      link.style.textDecoration = "underline";
    });

    link.addEventListener("mouseleave", () => {
      link.style.textDecoration = "none";
    });

    link.addEventListener("mousedown", (e) => {
      if (this.options.selected) {
        return;
      }

      e.stopPropagation();

      this.wrapper.dispatchEvent(
        new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: true,
          clientX: e.clientX,
          clientY: e.clientY,
        }),
      );
    });

    link.addEventListener("click", (e) => {
      if (!this.options.selected) {
        e.stopPropagation();
      }
    });

    mediaWrap.appendChild(link);
    this.wrapper.appendChild(mediaWrap);
  }

  /**
   * 渲染调整大小手柄 / Render resize handles
   */
  private renderResizeHandles(): void {
    const dirs: HandleDirection[] = [
      "free-editor__top-left",
      "free-editor__top",
      "free-editor__top-right",
      "free-editor__right",
      "free-editor__bottom-right",
      "free-editor__bottom",
      "free-editor__bottom-left",
      "free-editor__left",
    ];

    dirs.forEach((dir) => {
      const el = document.createElement("span");

      el.className = `free-editor__resize-handle ${dir}`;

      el.onmousedown = (e: MouseEvent): void => this.startResize(e, dir);

      this.wrapper.appendChild(el);
    });
  }

  /**
   * 开始调整大小 / Start resize
   * @param e 鼠标事件 / Mouse event
   * @param dir 手柄方向 / Handle direction
   */
  private startResize(
    e: MouseEvent,

    dir: HandleDirection,
  ): void {
    if (!this.isResizable) {
      return;
    }

    e.preventDefault();

    e.stopPropagation();

    this.currentHandle = dir;

    this.startX = e.clientX;

    this.startWidth = this.wrapper.offsetWidth;

    document.addEventListener(
      "mousemove",

      this.onResize,
    );

    document.addEventListener(
      "mouseup",

      this.stopResize,
    );
  }

  /**
   * 处理调整大小 / Handle resize
   * @param e 鼠标事件 / Mouse event
   */
  private onResize = (e: MouseEvent): void => {
    const dx = e.clientX - this.startX;

    let width = this.startWidth;

    switch (this.currentHandle) {
      case "free-editor__right":
      case "free-editor__top-right":
      case "free-editor__bottom-right":
        width += dx;
        break;

      case "free-editor__left":
      case "free-editor__top-left":
      case "free-editor__bottom-left":
        width -= dx;
        break;
    }

    width = Math.max(80, width);

    this.resizeWidth = `${width}px`;

    this.wrapper.style.width = this.resizeWidth;
  };

  /**
   * 停止调整大小 / Stop resize
   */
  private stopResize = (): void => {
    document.removeEventListener(
      "mousemove",

      this.onResize,
    );

    document.removeEventListener(
      "mouseup",

      this.stopResize,
    );

    if (this.resizeWidth) {
      this.options.updateAttributes({
        width: this.resizeWidth,
        height: "auto",
      });

      this.resizeWidth = "";
    }
  };

  /**
   * 获取包装器元素（用于定位悬浮工具栏） / Get wrapper element (for floating toolbar positioning)
   * @returns 包装器元素 / Wrapper element
   */
  getWrapper(): HTMLElement {
    return this.wrapper;
  }

  /**
   * 设置选中状态 / Set selected state
   * @param selected 是否选中 / Whether selected
   */
  setSelected(selected: boolean): void {
    this.options.selected = selected;

    const video = this.wrapper.querySelector(
      "video",
    ) as HTMLVideoElement | null;
    const playIcon = this.wrapper.querySelector(
      ".free-editor__video-play-icon",
    ) as HTMLElement | null;

    if (playIcon) {
      playIcon.style.opacity = selected ? "0" : "1";
    }

    if (video) {
      video.controls = selected;
    }

    if (selected) {
      this.wrapper.classList.add("free-editor__selected");
    } else {
      this.wrapper.classList.remove("free-editor__selected");
    }

    /** 同步调整大小手柄：禁用/只读时隐藏，恢复正常时显示 */
    this.syncResizeHandles();
  }

  /**
   * 同步调整大小手柄 / Sync resize handles
   * 根据 isResizable 和选中状态，添加或移除调整大小手柄。
   * 禁用/只读时自动隐藏，恢复正常时自动显示。
   */
  private syncResizeHandles(): void {
    /** 先移除所有现有手柄 */
    this.removeResizeHandles();

    /** 如果可调整大小且处于选中状态，重新渲染手柄 */
    if (this.isResizable && this.options.selected) {
      this.renderResizeHandles();
    }
  }

  /**
   * 移除所有调整大小手柄 / Remove all resize handles
   */
  private removeResizeHandles(): void {
    this.wrapper
      .querySelectorAll(".free-editor__resize-handle")
      .forEach((el) => el.remove());
  }

  /**
   * 更新节点属性 / Update node attributes
   * @param attrs 新属性 / New attributes
   */
  update(attrs: MediaNodeAttrs): void {
    const prevAttrs = this.options.attrs;

    this.options.attrs = {
      ...this.options.attrs,
      ...attrs,
    };

    const nextAttrs = this.options.attrs;

    this.updateWrapperWidth(nextAttrs);

    if (nextAttrs.loading && prevAttrs.loading) {
      updateProgressText(
        this.wrapper,
        ".free-editor__progress",
        nextAttrs.progress || 0,
      );

      return;
    }

    if (!this.hasStateChanged(prevAttrs, nextAttrs)) {
      return;
    }

    this.reRenderContent(nextAttrs);

    if (this.options.selected) {
      this.wrapper.classList.add("free-editor__selected");
    }
  }

  /**
   * 更新包装器宽度 / Update wrapper width
   * @param attrs 节点属性 / Node attributes
   */
  private updateWrapperWidth(attrs: MediaNodeAttrs): void {
    const isAttachment = attrs.type === "attachment";

    this.wrapper.style.width = isAttachment
      ? attrs.width || "auto"
      : attrs.width || "100%";
  }

  /**
   * 检查状态是否发生变化 / Check if state has changed
   * @param prev 先前属性 / Previous attributes
   * @param next 当前属性 / Current attributes
   * @returns 是否发生变化 / Whether changed
   */
  private hasStateChanged(
    prev: MediaNodeAttrs,
    next: MediaNodeAttrs,
  ): boolean {
    return (
      prev.loading !== next.loading ||
      prev.error !== next.error ||
      prev.src !== next.src ||
      prev.type !== next.type ||
      prev.name !== next.name ||
      prev.size !== next.size
    );
  }

  /**
   * 重新渲染内容 / Re-render content
   * @param attrs 节点属性 / Node attributes
   */
  private reRenderContent(attrs: MediaNodeAttrs): void {
    this.wrapper.innerHTML = "";

    if (attrs.loading) {
      this.renderLoading();
    } else if (attrs.error) {
      this.renderError();
    } else {
      this.renderMedia();

      if (attrs.type !== "attachment" && this.isResizable) {
        this.renderResizeHandles();
      }
    }
  }

  /**
   * 设置预设宽度 / Set preset width
   * @param p 比例值 / Ratio value
   */
  setPresetWidth(p: number): void {
    const width = `${p * 100}%`;

    this.wrapper.style.width = width;

    this.options.updateAttributes({
      width,
      height: "auto",
    });
  }

  /**
   * 重置尺寸 / Reset size
   */
  resetSize(): void {
    this.wrapper.style.width = "auto";

    this.options.updateAttributes({
      width: "auto",
      height: "auto",
    });
  }

  /**
   * 打开附件（新标签页） / Open attachment (new tab)
   */
  openAttachment(): void {
    const { attrs } = this.options;

    if (!attrs.src) return;

    window.open(attrs.src, "_blank", "noopener,noreferrer");
  }

  /**
   * 删除节点 / Delete node
   */
  deleteNode(): void {
    this.options.deleteNode();
  }

  /**
   * 获取根元素 / Get root element
   * @returns 根元素 / Root element
   */
  getElement(): HTMLElement {
    return this.el;
  }

  /**
   * 销毁节点视图 / Destroy node view
   */
  destroy(): void {
    this.unsubscribeLocale?.();
    this.unsubscribeLocale = null;

    this.stopResize();

    this.el.remove();
  }
}
