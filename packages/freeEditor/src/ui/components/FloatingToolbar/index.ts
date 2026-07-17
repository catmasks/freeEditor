import { FloatingManager } from "./FloatingManager";

/**
 * 浮动工具栏放置位置 / Floating toolbar placement
 */
export type FloatingPlacement =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

/**
 * 浮动目标类型 / Floating target type
 */
type FloatingTarget = HTMLElement | DOMRect | null;

/**
 * 浮动工具栏选项 / Floating toolbar options
 */
interface FloatingToolbarOptions {
  /** 目标元素或 DOMRect / Target element or DOMRect */
  target: FloatingTarget;
  /** 放置位置 / Placement position */
  placement?: FloatingPlacement;
  /** 偏移量 / Offset value */
  offset?: number;
  /** 是否按 ESC 关闭 / Whether to close on ESC */
  closeOnEsc?: boolean;
  /** 内容 / Content */
  content: string | HTMLElement;
  /** 显示时回调 / Show callback */
  onShow?: () => void;
  /** 关闭时回调 / Close callback */
  onClose?: () => void;
}

/**
 * 浮动工具栏组件 / Floating toolbar component
 */
export class FloatingToolbar {
  /**
   * 唯一标识符 / Unique identifier
   */
  private id: string;

  /**
   * 配置选项 / Configuration options
   */
  private options: Required<FloatingToolbarOptions>;

  /**
   * 工具栏元素 / Toolbar element
   */
  private toolbarEl: HTMLElement | null = null;

  /**
   * 是否可见 / Whether it is visible
   */
  private visible = false;

  /**
   * 是否正在显示动画中 / Whether show animation is in progress
   */
  private showAnimating = false;

  /**
   * 是否正在隐藏动画中 / Whether hide animation is in progress
   */
  private hideAnimating = false;

  /**
   * 隐藏动画定时器 / Hide animation timer
   */
  private hideTimer: number | null = null;

  /**
   * 是否已销毁 / Whether it is destroyed
   */
  private destroyed = false;

  /**
   * 尺寸观察器 / Resize observer
   */
  private resizeObserver: ResizeObserver | null = null;

  /**
   * 变化观察器 / Mutation observer
   */
  private mutationObserver: MutationObserver | null = null;

  /**
   * 当前滚动父级 / Current scroll parent
   */
  private currentScrollParent: HTMLElement | Window | null = null;

  /**
   * 滚动事件处理器 / Scroll event handler
   */
  private scrollHandler: ((e: Event) => void) | null = null;

  /**
   * 窗口大小变化事件处理器 / Window resize event handler
   */
  private resizeHandler: ((e: UIEvent) => void) | null = null;

  /**
   * 键盘按下事件处理器 / Keydown event handler
   */
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  /**
   * 浮动管理器实例 / Floating manager instance
   */
  private manager = FloatingManager.getInstance();

  /**
   * 构造函数 / Constructor
   * @param options - 浮动工具栏选项 / Floating toolbar options
   */
  constructor(options: FloatingToolbarOptions) {
    this.id = crypto.randomUUID
      ? crypto.randomUUID()
      : `ft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    this.options = {
      placement: "bottom-center",

      offset: 3,

      closeOnEsc: true,

      ...options,
    } as Required<FloatingToolbarOptions>;

    this.createToolbar();

    this.registerToManager();

    this.bindEvents();
  }

  /**
   * 创建工具栏元素 / Create toolbar element
   */
  private createToolbar(): void {
    const el = document.createElement("div");

    el.className = "floating-toolbar floating-toolbar-enter-from";

    el.dataset.theme = document.documentElement.dataset.theme || "light";

    el.style.display = "none";

    el.setAttribute("data-toolbar-id", this.id);

    const content = this.options.content;

    if (typeof content === "string") {
      el.innerHTML = content;
    } else {
      el.appendChild(content);
    }

    document.body.appendChild(el);

    this.toolbarEl = el;
  }

  /**
   * 注册到管理器 / Register to manager
   */
  private registerToManager(): void {
    this.manager.register(this.id, {
      close: () => this.hide(),

      getToolbarEl: () => this.toolbarEl,

      getTargetEl: () => this.getTargetElement(),

      isPointInTarget: (x, y) => this.isPointInTarget(x, y),

      options: {
        ignoreTargetClick: true,
      },
    });
  }

  /**
   * 从管理器注销 / Unregister from manager
   */
  private unregisterFromManager(): void {
    this.manager.unregister(this.id);
  }

  /**
   * 获取目标元素 / Get target element
   * @returns 目标元素或 null / Target element or null
   */
  private getTargetElement(): HTMLElement | null {
    const target = this.options.target;

    return target instanceof HTMLElement ? target : null;
  }

  /**
   * 获取目标矩形 / Get target rectangle
   * @returns 目标矩形或 null / Target rectangle or null
   */
  private getTargetRect(): DOMRect | null {
    const target = this.options.target;

    if (!target) {
      return null;
    }

    if (target instanceof HTMLElement) {
      return target.getBoundingClientRect();
    }

    return target;
  }

  /**
   * 获取放置位置 / Get placement
   * @returns 放置位置 / Placement
   */
  private getPlacement(): FloatingPlacement {
    return this.options.placement;
  }

  /**
   * 获取偏移量 / Get offset
   * @returns 偏移量 / Offset
   */
  private getOffset(): number {
    return this.options.offset;
  }

  /**
   * 是否为顶部放置 / Whether it is top placement
   * @returns 是否为顶部放置 / Whether it is top placement
   */
  private isTopPlacement(): boolean {
    return this.getPlacement().startsWith("top");
  }

  /**
   * 获取对齐方式 / Get alignment type
   * @returns 对齐方式 / Alignment type
   */
  private getAlignType(): "start" | "center" | "end" {
    const placement = this.getPlacement();

    if (placement.endsWith("start")) {
      return "start";
    }

    if (placement.endsWith("end")) {
      return "end";
    }

    return "center";
  }

  /**
   * 替换放置位置 / Replace placement
   * @param placement - 原放置位置 / Original placement
   * @param from - 要替换的位置 / Position to replace
   * @param to - 目标位置 / Target position
   * @returns 新的放置位置 / New placement
   */
  private replacePlacement(
    placement: FloatingPlacement,

    from: "top" | "bottom",

    to: "top" | "bottom",
  ): FloatingPlacement {
    return placement.replace(from, to) as FloatingPlacement;
  }

  /**
   * 获取滚动父级 / Get scroll parent
   * @param element - 目标元素 / Target element
   * @returns 滚动父级元素或 window / Scroll parent element or window
   */
  private getScrollParent(element: HTMLElement | null): HTMLElement | Window {
    if (!element) {
      return window;
    }

    let parent = element.parentElement;

    while (parent) {
      const style = window.getComputedStyle(parent);

      const overflowY = style.overflowY;

      const overflowX = style.overflowX;

      const isScrollable =
        ["auto", "scroll", "overlay"].includes(overflowY) ||
        ["auto", "scroll", "overlay"].includes(overflowX);

      if (
        isScrollable &&
        (parent.scrollHeight > parent.clientHeight ||
          parent.scrollWidth > parent.clientWidth)
      ) {
        return parent;
      }

      parent = parent.parentElement;
    }

    return window;
  }

  /**
   * 获取边界矩形 / Get boundary rectangle
   * @param target - 目标元素 / Target element
   * @returns 边界矩形 / Boundary rectangle
   */
  private getBoundaryRect(target: HTMLElement | null) {
    const scrollParent = this.getScrollParent(target);

    if (scrollParent instanceof HTMLElement) {
      return scrollParent.getBoundingClientRect();
    }

    return {
      top: 0,
      left: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  /**
   * 同步主题 / Sync theme
   */
  private syncTheme(): void {
    if (!this.toolbarEl) {
      return;
    }

    this.toolbarEl.dataset.theme =
      document.documentElement.dataset.theme || "light";
  }

  /**
   * 更新位置 / Update position
   */
  private async updatePosition(): Promise<void> {
    if (this.destroyed) {
      return;
    }

    const toolbar = this.toolbarEl;

    const targetRect = this.getTargetRect();

    if (!toolbar || !targetRect) {
      return;
    }

    await new Promise((r) => requestAnimationFrame(r));

    const toolbarRect = toolbar.getBoundingClientRect();

    if (!toolbarRect.width || !toolbarRect.height) {
      return;
    }

    const offset = this.getOffset();

    const targetEl = this.getTargetElement();

    const boundaryRect = this.getBoundaryRect(targetEl);

    const placement = this.getPlacement();

    const alignType = this.getAlignType();

    const isTop = this.isTopPlacement();

    let left = 0;

    switch (alignType) {
      case "start":
        left = targetRect.left;
        break;

      case "end":
        left = targetRect.right - toolbarRect.width;
        break;

      default:
        left = targetRect.left + targetRect.width / 2 - toolbarRect.width / 2;
    }

    let top = isTop
      ? targetRect.top - toolbarRect.height - offset
      : targetRect.bottom + offset;

    let finalPlacement = placement;

    if (isTop) {
      const overflowTop = top < boundaryRect.top + 8;

      if (overflowTop) {
        top = targetRect.bottom + offset;

        finalPlacement = this.replacePlacement(placement, "top", "bottom");
      }
    } else {
      const overflowBottom = top + toolbarRect.height > boundaryRect.bottom - 8;

      if (overflowBottom) {
        top = targetRect.top - toolbarRect.height - offset;

        finalPlacement = this.replacePlacement(placement, "bottom", "top");
      }
    }

    if (top < boundaryRect.top + 8) {
      top = boundaryRect.top + 8;
    }

    if (top + toolbarRect.height > boundaryRect.bottom - 8) {
      top = boundaryRect.bottom - toolbarRect.height - 8;
    }

    left = Math.max(8, left);

    left = Math.min(window.innerWidth - toolbarRect.width - 8, left);

    let transformOrigin = "bottom center";

    if (finalPlacement.startsWith("bottom")) {
      transformOrigin = "top center";
    }

    if (finalPlacement.endsWith("start")) {
      transformOrigin = transformOrigin.replace("center", "left");
    }

    if (finalPlacement.endsWith("end")) {
      transformOrigin = transformOrigin.replace("center", "right");
    }

    toolbar.style.top = `${top}px`;

    toolbar.style.left = `${left}px`;

    toolbar.style.transformOrigin = transformOrigin;
  }

  /**
   * 设置观察器 / Setup observers
   */
  private setupObservers(): void {
    this.cleanupObservers();

    const targetEl = this.getTargetElement();

    const toolbar = this.toolbarEl;

    if (!targetEl) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      if (this.visible) {
        this.updatePosition();
      }
    });

    this.resizeObserver.observe(targetEl);

    if (toolbar) {
      this.resizeObserver.observe(toolbar);
    }

    this.currentScrollParent = this.getScrollParent(targetEl);

    if (this.currentScrollParent instanceof HTMLElement) {
      this.resizeObserver.observe(this.currentScrollParent);
    }

    this.mutationObserver = new MutationObserver(() => {
      if (this.visible) {
        this.updatePosition();
      }
    });

    const root = targetEl.parentElement || document.body;

    this.mutationObserver.observe(root, {
      attributes: true,

      childList: true,

      subtree: true,
    });
  }

  /**
   * 清理观察器 / Cleanup observers
   */
  private cleanupObservers(): void {
    this.resizeObserver?.disconnect();

    this.resizeObserver = null;

    this.mutationObserver?.disconnect();

    this.mutationObserver = null;

    this.currentScrollParent = null;
  }

  /**
   * 绑定事件 / Bind events
   */
  private bindEvents(): void {
    this.scrollHandler = () => {
      if (this.visible) {
        this.updatePosition();
      }
    };

    window.addEventListener("scroll", this.scrollHandler, true);

    this.resizeHandler = () => {
      if (this.visible) {
        this.updatePosition();
      }
    };

    window.addEventListener("resize", this.resizeHandler);

    this.keydownHandler = (e) => {
      if (!this.visible) {
        return;
      }

      if (!this.options.closeOnEsc) {
        return;
      }

      if (e.key === "Escape") {
        this.hide();
      }
    };

    window.addEventListener("keydown", this.keydownHandler);
  }

  /**
   * 解绑事件 / Unbind events
   */
  private unbindEvents(): void {
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler, true);

      this.scrollHandler = null;
    }

    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);

      this.resizeHandler = null;
    }

    if (this.keydownHandler) {
      window.removeEventListener("keydown", this.keydownHandler);

      this.keydownHandler = null;
    }
  }

  /**
   * 显示工具栏 / Show toolbar
   */
  async show(): Promise<void> {
    if (this.destroyed) {
      return;
    }

    const toolbar = this.toolbarEl;

    if (!toolbar) {
      return;
    }

    if (this.visible && !this.hideAnimating) {
      return;
    }

    if (this.hideAnimating) {
      if (this.hideTimer !== null) {
        clearTimeout(this.hideTimer);
        this.hideTimer = null;
      }
      this.hideAnimating = false;

      toolbar.classList.remove("floating-toolbar-leave-active");
      toolbar.classList.remove("floating-toolbar-leave-to");
    }

    this.visible = true;
    this.showAnimating = true;

    this.manager.activate(this.id);

    this.syncTheme();

    toolbar.style.display = "flex";

    toolbar.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      e.preventDefault();
    });

    toolbar.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      e.preventDefault();
    });

    toolbar.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    toolbar.classList.remove("floating-toolbar-enter-from");
    toolbar.classList.remove("floating-toolbar-enter-to");

    void toolbar.offsetHeight;

    toolbar.classList.add("floating-toolbar-enter-active");
    toolbar.classList.add("floating-toolbar-enter-to");

    await this.updatePosition();

    this.setupObservers();

    this.showAnimating = false;

    this.options.onShow?.();
  }

  /**
   * 隐藏工具栏 / Hide toolbar
   * @param animate - 是否播放动画 / Whether to play animation
   */
  async hide(animate = true): Promise<void> {
    if (this.destroyed) {
      return;
    }

    const toolbar = this.toolbarEl;

    if (!toolbar) {
      return;
    }

    if (!this.visible && !this.showAnimating) {
      return;
    }

    if (this.showAnimating) {
      this.showAnimating = false;
    }

    this.visible = false;
    this.hideAnimating = true;

    this.cleanupObservers();

    this.manager.close(this.id);

    if (animate) {
      toolbar.classList.remove("floating-toolbar-enter-to");
      toolbar.classList.add("floating-toolbar-leave-active");
      toolbar.classList.add("floating-toolbar-leave-to");

      await new Promise<void>((resolve) => {
        this.hideTimer = window.setTimeout(() => {
          this.hideTimer = null;
          resolve();
        }, 200);
      });

      if (!this.hideAnimating) {
        return;
      }

      this.hideAnimating = false;

      toolbar.classList.remove("floating-toolbar-leave-active");
      toolbar.classList.remove("floating-toolbar-leave-to");
    } else {
      this.hideAnimating = false;
    }

    toolbar.style.display = "none";

    this.options.onClose?.();
  }

  /**
   * 切换显示状态 / Toggle visibility
   */
  async toggle(): Promise<void> {
    if (this.visible) {
      await this.hide();
    } else {
      await this.show();
    }
  }

  /**
   * 设置目标 / Set target
   * @param target - 目标元素或 DOMRect / Target element or DOMRect
   */
  setTarget(target: FloatingTarget): void {
    this.options.target = target;

    if (this.visible) {
      this.updatePosition();

      this.setupObservers();
    }
  }

  /**
   * 设置放置位置 / Set placement
   * @param placement - 放置位置 / Placement
   */
  setPlacement(placement: FloatingPlacement): void {
    this.options.placement = placement;

    if (this.visible) {
      this.updatePosition();
    }
  }

  /**
   * 设置偏移量 / Set offset
   * @param offset - 偏移量 / Offset
   */
  setOffset(offset: number): void {
    this.options.offset = offset;

    if (this.visible) {
      this.updatePosition();
    }
  }

  /**
   * 设置内容 / Set content
   * @param content - 内容 / Content
   */
  setContent(content: string | HTMLElement): void {
    this.options.content = content;

    const el = this.toolbarEl;

    if (!el) {
      return;
    }

    el.innerHTML = "";

    if (typeof content === "string") {
      el.innerHTML = content;
    } else {
      el.appendChild(content);
    }

    if (this.visible) {
      this.updatePosition();

      this.setupObservers();
    }
  }

  /**
   * 获取 ID / Get ID
   * @returns 唯一标识符 / Unique identifier
   */
  getId(): string {
    return this.id;
  }

  /**
   * 获取元素 / Get element
   * @returns 工具栏元素或 null / Toolbar element or null
   */
  getElement(): HTMLElement | null {
    return this.toolbarEl;
  }

  /**
   * 是否可见 / Whether it is visible
   * @returns 是否可见 / Whether it is visible
   */
  isVisible(): boolean {
    return this.visible;
  }

  /**
   * 检测点是否在目标区域内 / Check if point is inside target area
   * @param x - X 坐标 / X coordinate
   * @param y - Y 坐标 / Y coordinate
   * @returns 是否在目标区域内 / Whether inside target area
   */
  isPointInTarget(x: number, y: number): boolean {
    const targetRect = this.getTargetRect();
    if (!targetRect) {
      return false;
    }

    return (
      x >= targetRect.left &&
      x <= targetRect.right &&
      y >= targetRect.top &&
      y <= targetRect.bottom
    );
  }

  /**
   * 销毁工具栏 / Destroy toolbar
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;

    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    this.hideAnimating = false;
    this.showAnimating = false;

    this.hide(false);

    this.unbindEvents();

    this.cleanupObservers();

    this.unregisterFromManager();

    this.toolbarEl?.remove();

    this.toolbarEl = null;
  }
}
