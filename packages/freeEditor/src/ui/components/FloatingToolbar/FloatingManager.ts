/**
 * 浮动工具栏 API 接口 / Floating toolbar API interface
 */
interface FloatingAPI {
  /** 关闭方法 / Close method */
  close: () => void;
  /** 获取工具栏元素 / Get toolbar element */
  getToolbarEl: () => HTMLElement | null;
  /** 获取目标元素 / Get target element */
  getTargetEl: () => HTMLElement | null;
  /** 检测点是否在目标区域内 / Check if point is inside target area */
  isPointInTarget?: (x: number, y: number) => boolean;
  /** 配置选项 / Configuration options */
  options: {
    /** 是否忽略目标点击 / Whether to ignore target click */
    ignoreTargetClick?: boolean;
  };
}

/**
 * 浮动工具栏管理器 / Floating toolbar manager
 */
export class FloatingManager {
  /**
   * 单例实例 / Singleton instance
   */
  private static instance: FloatingManager;

  /**
   * 浮动实例映射 / Floating instance map
   */
  private instances = new Map<string, FloatingAPI>();

  /**
   * 当前激活的 ID / Currently active ID
   */
  private activeId: string | null = null;

  /**
   * 激活状态监听器集合 / Active state listener set
   */
  private activeListeners = new Set<(id: string | null) => void>();

  /**
   * 是否已绑定全局事件 / Whether global events are bound
   */
  private bound = false;

  /**
   * 私有构造函数 / Private constructor
   */
  private constructor() {
    this.bindGlobalEvents();
  }

  /**
   * 获取单例实例 / Get singleton instance
   * @returns 浮动管理器实例 / Floating manager instance
   */
  static getInstance(): FloatingManager {
    if (!FloatingManager.instance) {
      FloatingManager.instance = new FloatingManager();
    }
    return FloatingManager.instance;
  }

  /**
   * 订阅激活状态变化 / Subscribe to active state changes
   * @param fn - 回调函数 / Callback function
   * @returns 取消订阅函数 / Unsubscribe function
   */
  onActiveChange(fn: (id: string | null) => void) {
    this.activeListeners.add(fn);

    return () => {
      this.activeListeners.delete(fn);
    };
  }

  /**
   * 通知激活状态变化 / Notify active state changes
   */
  private notifyActiveChange() {
    this.activeListeners.forEach((fn) => fn(this.activeId));
  }

  /**
   * 注册浮动实例 / Register floating instance
   * @param id - 实例 ID / Instance ID
   * @param api - 浮动 API / Floating API
   */
  register(id: string, api: FloatingAPI): void {
    this.instances.set(id, api);
  }

  /**
   * 注销浮动实例 / Unregister floating instance
   * @param id - 实例 ID / Instance ID
   */
  unregister(id: string): void {
    this.instances.delete(id);

    if (this.activeId === id) {
      this.activeId = null;
      this.notifyActiveChange();
    }
  }

  /**
   * 激活浮动实例 / Activate floating instance
   * @param id - 实例 ID / Instance ID
   */
  activate(id: string): void {
    if (this.activeId && this.activeId !== id) {
      this.instances.get(this.activeId)?.close();
    }

    this.activeId = id;

    this.notifyActiveChange();
  }

  /**
   * 关闭浮动实例 / Close floating instance
   * @param id - 实例 ID（可选，不传则关闭全部） / Instance ID (optional, close all if not provided)
   */
  close(id?: string): void {
    if (id) {
      this.instances.get(id)?.close();

      if (this.activeId === id) {
        this.activeId = null;
        this.notifyActiveChange();
      }

      return;
    }

    this.closeAll();
  }

  /**
   * 关闭所有浮动实例 / Close all floating instances
   */
  closeAll(): void {
    this.instances.forEach((api) => api.close());

    this.activeId = null;
    this.notifyActiveChange();
  }

  /**
   * 获取当前激活的 ID / Get currently active ID
   * @returns 当前激活的 ID / Currently active ID
   */
  getActiveId() {
    return this.activeId;
  }

  /**
   * 绑定全局事件 / Bind global events
   */
  private bindGlobalEvents(): void {
    if (this.bound) return;
    this.bound = true;

    window.addEventListener("pointerdown", (e) => {
      if (!this.activeId) return;

      const active = this.instances.get(this.activeId);
      if (!active) return;

      const toolbar = active.getToolbarEl();
      const target = active.getTargetEl();

      const path = (e.composedPath?.() || []) as EventTarget[];

      const inToolbar =
        toolbar &&
        (path.includes(toolbar) || toolbar.contains(e.target as Node));

      const inTarget =
        target && (path.includes(target) || target.contains(e.target as Node));

      const inTargetRect = active.isPointInTarget
        ? active.isPointInTarget(e.clientX, e.clientY)
        : false;

      if (inToolbar || inTarget || inTargetRect) return;

      active.close();
      this.activeId = null;

      this.notifyActiveChange();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeAll();
    });

    window.addEventListener("popstate", () => {
      this.closeAll();
    });
  }
}
