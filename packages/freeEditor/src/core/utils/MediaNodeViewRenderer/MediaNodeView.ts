import { FloatingToolbar } from "../../../ui/index";
import { i18n } from "../../i18n/index";
import type { MediaNodeAttrs } from "./types";

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
 * 媒体工具栏控制器 / Media toolbar controller
 */
class MediaToolbarController {
  /**
   * 浮动工具栏实例 / Floating toolbar instance
   */
  private toolbar: FloatingToolbar | null = null;

  /**
   * 获取目标元素函数 / Get target element function
   */
  private getTarget: () => HTMLElement | null;

  /**
   * 预设尺寸回调 / Preset size callback
   * @param _p 比例值 / Ratio value
   */
  onPreset = (_p: number) => {};

  /**
   * 重置尺寸回调 / Reset size callback
   */
  onReset = () => {};

  /**
   * 删除回调 / Delete callback
   */
  onDelete = () => {};

  /**
   * 构造函数 / Constructor
   * @param getTarget 获取目标元素函数 / Get target element function
   */
  constructor(getTarget: () => HTMLElement | null) {
    this.getTarget = getTarget;
  }

  /**
   * 初始化工具栏 / Initialize toolbar
   */
  init() {
    const target = this.getTarget();

    if (!target) {
      return;
    }

    this.toolbar = new FloatingToolbar({
      target,
      placement: "top-center",
      offset: 8,
      closeOnEsc: true,
      content: this.createContent(),
    });
  }

  /**
   * 刷新工具栏内容（语言切换时调用） / Refresh toolbar content (called on locale change)
   */
  refreshContent() {
    if (!this.toolbar) {
      return;
    }

    const target = this.getTarget();
    if (!target) {
      return;
    }

    const wasVisible = this.toolbar.isVisible();
    this.toolbar.destroy();

    this.toolbar = new FloatingToolbar({
      target,
      placement: "top-center",
      offset: 8,
      closeOnEsc: true,
      content: this.createContent(),
    });

    if (wasVisible) {
      this.toolbar.show();
    }
  }

  /**
   * 创建工具栏内容 / Create toolbar content
   * @returns 工具栏内容元素 / Toolbar content element
   */
  private createContent(): HTMLElement {
    const wrap = document.createElement("div");

    wrap.style.display = "flex";

    wrap.style.alignItems = "center";

    wrap.style.gap = "4px";

    const btn = (
      text: string,

      fn: () => void,

      className = "",
    ) => {
      const el = document.createElement("span");

      el.className = `free-editor__media-node__action ${className}`;

      el.textContent = text;

      el.onclick = (e) => {
        e.stopPropagation();

        fn();
      };

      return el;
    };

    wrap.appendChild(btn("30%", () => this.onPreset(0.3), "primary"));

    wrap.appendChild(btn("50%", () => this.onPreset(0.5), "primary"));

    wrap.appendChild(btn("100%", () => this.onPreset(1), "primary"));

    wrap.appendChild(
      btn(i18n.t("media.resetSize"), () => this.onReset(), "primary"),
    );

    wrap.appendChild(
      btn(i18n.t("common.remove"), () => this.onDelete(), "danger"),
    );

    return wrap;
  }

  /**
   * 显示工具栏 / Show toolbar
   */
  show() {
    this.toolbar?.show();
  }

  /**
   * 隐藏工具栏 / Hide toolbar
   */
  hide() {
    this.toolbar?.hide();
  }

  /**
   * 同步目标元素 / Sync target element
   */
  syncTarget() {
    const el = this.getTarget();

    if (!el) {
      return;
    }

    this.toolbar?.setTarget(el);
  }

  /**
   * 销毁工具栏 / Destroy toolbar
   */
  destroy() {
    this.toolbar?.destroy();
    this.toolbar = null;
  }
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
   * 工具栏控制器 / Toolbar controller
   */
  private toolbarController: MediaToolbarController | null = null;

  /**
   * 取消语言变化订阅 / Unsubscribe locale change
   */
  private unsubscribeLocale: (() => void) | null = null;

  /**
   * 构造函数 / Constructor
   * @param options 媒体节点选项 / Media node options
   */
  constructor(options: MediaNodeOptions) {
    this.options = options;

    this.render();

    this.initToolbar();

    // [I18N] 订阅语言变化
    this.unsubscribeLocale = i18n.subscribe(() => {
      this.refreshLocale();
    });
  }

  /**
   * 刷新语言（语言切换时重新渲染内容） / Refresh locale (re-render content on locale change)
   */
  private refreshLocale() {
    const { attrs } = this.options;

    this.wrapper.innerHTML = "";

    if (attrs.loading) {
      this.renderLoading();
    } else if (attrs.error) {
      this.renderError();
    } else {
      this.renderMedia();
      this.renderResizeHandles();
    }

    if (this.options.selected) {
      this.wrapper.classList.add("free-editor__selected");
    }

    this.toolbarController?.refreshContent();
    this.toolbarController?.syncTarget();
  }

  /**
   * 渲染节点视图 / Render node view
   */
  private render() {
    const { attrs } = this.options;

    this.el = document.createElement("span");

    this.el.className = "free-editor__media-node";

    this.wrapper = document.createElement("span");

    this.wrapper.className = "free-editor__media-resizer";

    this.applyWrapperStyle();

    if (attrs.loading) {
      this.renderLoading();
    } else if (attrs.error) {
      this.renderError();
    } else {
      this.renderMedia();

      this.renderResizeHandles();
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
  private applyWrapperStyle() {
    const { attrs } = this.options;

    this.wrapper.style.display = "inline-block";

    this.wrapper.style.maxWidth = "100%";

    this.wrapper.style.verticalAlign = "middle";

    this.wrapper.style.lineHeight = "0";

    this.wrapper.style.position = "relative";

    this.wrapper.style.width = attrs.width || "100%";
  }

  /**
   * 渲染加载状态 / Render loading state
   */
  private renderLoading() {
    const { attrs, uploader } = this.options;

    const box = document.createElement("span");

    box.className = "free-editor__media-loading";

    const spinner = document.createElement("span");

    spinner.className = "free-editor__spinner";

    const progress = document.createElement("span");

    progress.className = "free-editor__progress";

    progress.textContent = `${attrs.progress || 0}%`;

    const cancel = document.createElement("span");

    cancel.className = "free-editor__media-node__action danger";

    cancel.style.marginTop = "8px";

    cancel.textContent = i18n.t("media.cancelUpload");

    cancel.onclick = (e) => {
      e.stopPropagation();

      if (attrs.id) {
        uploader?.cancel(attrs.id);
      }

      this.options.deleteNode();
    };

    box.appendChild(spinner);

    box.appendChild(progress);

    box.appendChild(cancel);

    this.wrapper.appendChild(box);
  }

  /**
   * 渲染错误状态 / Render error state
   */
  private renderError() {
    const { attrs, uploader } = this.options;

    const box = document.createElement("span");

    box.className = "free-editor__media-error";

    box.textContent = i18n.t("media.uploadFailed");

    const toolbar = document.createElement("div");

    toolbar.style.display = "flex";

    toolbar.style.alignItems = "center";

    toolbar.style.gap = "6px";

    toolbar.style.marginTop = "8px";

    const retry = document.createElement("span");

    retry.className = "free-editor__media-node__action primary";

    retry.textContent = i18n.t("media.retry");

    retry.onclick = (e) => {
      e.stopPropagation();

      if (attrs.id) {
        uploader?.retry(attrs.id);
      }
    };

    const remove = document.createElement("span");

    remove.className = "free-editor__media-node__action danger";

    remove.textContent = i18n.t("common.remove");

    remove.onclick = (e) => {
      e.stopPropagation();

      this.options.deleteNode();
    };

    toolbar.appendChild(retry);

    toolbar.appendChild(remove);

    box.appendChild(toolbar);

    this.wrapper.appendChild(box);
  }

  /**
   * 渲染媒体内容 / Render media content
   */
  private renderMedia() {
    const { attrs } = this.options;

    const isVideo = attrs.type === "video";

    const mediaWrap = document.createElement("span");

    mediaWrap.className = "free-editor__media-inner";

    mediaWrap.style.position = "relative";

    mediaWrap.style.display = "block";

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

    mediaWrap.appendChild(media);

    this.wrapper.appendChild(mediaWrap);
  }

  /**
   * 渲染调整大小手柄 / Render resize handles
   */
  private renderResizeHandles() {
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

      el.onmousedown = (e) => this.startResize(e, dir);

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
  ) {
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
  private onResize = (e: MouseEvent) => {
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

    this.toolbarController?.syncTarget();
  };

  /**
   * 停止调整大小 / Stop resize
   */
  private stopResize = () => {
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
    }
  };

  /**
   * 初始化工具栏 / Initialize toolbar
   */
  private initToolbar() {
    this.toolbarController = new MediaToolbarController(() => this.wrapper);

    this.toolbarController.onPreset = (p) => this.setPresetWidth(p);

    this.toolbarController.onReset = () => this.resetSize();

    this.toolbarController.onDelete = () => this.options.deleteNode();

    this.toolbarController.init();

    if (this.options.selected) {
      this.toolbarController.show();
    }
  }

  /**
   * 设置选中状态 / Set selected state
   * @param selected 是否选中 / Whether selected
   */
  setSelected(selected: boolean) {
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

    if (!this.toolbarController) {
      return;
    }

    if (selected) {
      this.wrapper.classList.add("free-editor__selected");

      this.toolbarController.show();

      this.toolbarController.syncTarget();
    } else {
      this.wrapper.classList.remove("free-editor__selected");

      this.toolbarController.hide();
    }
  }

  /**
   * 更新节点属性 / Update node attributes
   * @param attrs 新属性 / New attributes
   */
  update(attrs: MediaNodeAttrs) {
    const prevAttrs = this.options.attrs;

    this.options.attrs = {
      ...this.options.attrs,
      ...attrs,
    };

    const nextAttrs = this.options.attrs;

    this.wrapper.style.width = nextAttrs.width || "100%";

    if (nextAttrs.loading && prevAttrs.loading) {
      const progressEl = this.wrapper.querySelector(
        ".free-editor__progress",
      ) as HTMLElement | null;

      if (progressEl) {
        progressEl.textContent = `${nextAttrs.progress || 0}%`;
      }

      return;
    }

    const stateChanged =
      prevAttrs.loading !== nextAttrs.loading ||
      prevAttrs.error !== nextAttrs.error ||
      prevAttrs.src !== nextAttrs.src ||
      prevAttrs.type !== nextAttrs.type;

    if (!stateChanged) {
      return;
    }

    this.wrapper.innerHTML = "";

    if (nextAttrs.loading) {
      this.renderLoading();
    } else if (nextAttrs.error) {
      this.renderError();
    } else {
      this.renderMedia();

      this.renderResizeHandles();
    }

    if (this.options.selected) {
      this.wrapper.classList.add("free-editor__selected");
    }

    this.toolbarController?.syncTarget();
  }

  /**
   * 设置预设宽度 / Set preset width
   * @param p 比例值 / Ratio value
   */
  private setPresetWidth(p: number) {
    const width = `${p * 100}%`;

    this.wrapper.style.width = width;

    this.toolbarController?.syncTarget();

    this.options.updateAttributes({
      width,
      height: "auto",
    });
  }

  /**
   * 重置尺寸 / Reset size
   */
  private resetSize() {
    this.wrapper.style.width = "auto";

    this.toolbarController?.syncTarget();

    this.options.updateAttributes({
      width: "auto",
      height: "auto",
    });
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
  destroy() {
    this.unsubscribeLocale?.();
    this.unsubscribeLocale = null;

    this.stopResize();

    this.toolbarController?.destroy();

    this.toolbarController = null;

    this.el.remove();
  }
}
