import { createToolbar } from "../ui/toolbar/index";
import { createEditorPlugins } from "./editorPlugins";
import { editorRuntimeState } from "./editorRuntimeState";
import { i18n, ensureEditorFocus, isNonContentTransaction } from "./index";
import type { Transaction } from "@tiptap/pm/state";
import { Editor as TiptapEditor, type JSONContent } from "@tiptap/core";
import type { MediaEngine } from "./utils/index";

import type {
  CreateEditorPluginsResult,
  EditorOptions,
  EditorTheme,
  FloatingToolbarAPI,
  Locale,
} from "./types/index";

/**
 * 单击内容区触发瞬断时，抑制焦点事件回调的窗口时长（毫秒）
 * Focus event suppression window (ms) opened when clicking content area causes a transient blur
 */
const FOCUS_EVENT_SUPPRESS_WINDOW = 120;

/**
 * 富文本编辑器主类 / Rich text editor main class
 */
export class Editor {
  /**
   * 是否已挂载 / Whether the editor is mounted
   */
  private mounted = false;

  /**
   * 是否已销毁 / Whether the editor is destroyed
   */
  private destroyed = false;

  /**
   * 根容器元素 / Root container element
   */
  private root!: HTMLElement;

  /**
   * 工具栏元素 / Toolbar element
   */
  private toolbar!: HTMLElement;

  /**
   * 内容区域元素 / Content area element
   */
  private content!: HTMLElement;

  /**
   * Tiptap 编辑器实例 / Tiptap editor instance
   */
  private editor!: TiptapEditor;

  /**
   * 插件创建结果 / Plugin creation result
   */
  private pluginResult!: CreateEditorPluginsResult;

  /**
   * 销毁钩子函数数组 / Array of destroy hook functions
   */
  private destroyHooks: (() => void)[] = [];

  /**
   * 当前语言 / Current locale
   */
  private currentLocale!: Locale;

  /**
   * 取消语言变化订阅 / Unsubscribe locale change
   */
  private unsubscribeLocale: (() => void) | null = null;

  /**
   * 销毁回调
   * Destroy callback
   */
  private onDestroyCallback?: () => void;

  /**
   * 焦点事件抑制窗口的截止时间（performance.now() 时间戳）
   * Timestamp marking the end of the focus-event suppression window
   * 窗口内由内容区点击引起的瞬断 onBlur/onFocus 不会派发到回调。
   */
  private focusGuardSuppressUntil = 0;

  /**
   * 媒体引擎实例引用（用于禁用状态同步） / Media engine instance reference (for disabled state sync)
   */
  private mediaEngine: MediaEngine | null = null;

  /**
   * 当前禁用状态 / Current disabled state
   */
  private isDisabled = false;

  /**
   * 当前只读状态 / Current readonly state
   */
  private isReadonly = false;

  /**
   * 高度配置（像素） / Height configuration (pixels)
   */
  private heightOption?: number;

  /**
   * 最大高度配置（像素） / Max height configuration (pixels)
   */
  private maxHeightOption?: number;

  /**
   * 工具栏尺寸监听器 / Toolbar resize observer
   */
  private toolbarObserver: ResizeObserver | null = null;

  /**
   * 构造函数 / Constructor
   * @param el - 挂载的 DOM 元素 / DOM element to mount
   * @param options - 编辑器配置选项 / Editor configuration options
   */
  constructor(el: HTMLElement, options: EditorOptions = {}) {
    this.assertBrowserEnvironment();

    const { initialDisabled, initialReadonly } = this.initRuntimeState(options);

    this.initDOM(el, options);

    // 全局语言仅由第一个编辑器认领，后续并存实例不再静默覆盖，
    // 避免多编辑器共存时后建实例改动先建实例的语言。
    // 显式调用 editor.setLocale() / i18n.setLocale() 仍可随时切换全局语言。
    editorRuntimeState.activeEditorCount += 1;
    if (editorRuntimeState.activeEditorCount === 1) {
      i18n.setLocale(this.currentLocale);
    }

    this.initEditor(options);

    this.initMediaEngine();

    this.setupEventBlocking();

    this.subscribeLocale();

    this.initHeight(options);

    this.mounted = true;

    this.applyInitialStates(initialDisabled, initialReadonly);

    /** 编辑器已挂载并初始化完成*/
    options.onCreated?.();
  }

  /**
   * 运行时环境守卫 / Runtime environment guard
   *
   * 根元素挂载与 ProseMirror 视图依赖真实的浏览器 DOM。
   * 在 SSR（服务端渲染）环境返回响应之前不会调用构造函数；
   */
  private assertBrowserEnvironment(): void {
    if (typeof document === "undefined") {
      throw new Error(
        "[FreeEditor] 编辑器的 DOM 初始化只支持在浏览器（客户端）运行时执行。" +
          " 请确保只在浏览器端调用 new Editor()（例如在 onMounted 或 useEffect 中）。" +
          " / Editor DOM initialization is only supported in the browser (client) runtime." +
          " Please only call new Editor() on the client side (e.g. in onMounted or useEffect).",
      );
    }
  }

  /**
   * 初始化运行时状态 / Initialize runtime state
   */
  private initRuntimeState(options: EditorOptions): {
    initialDisabled: boolean;
    initialReadonly: boolean;
  } {
    const initialDisabled = Boolean(options.disabled);
    const initialReadonly = Boolean(options.readonly);
    editorRuntimeState.disabled = initialDisabled;
    editorRuntimeState.readonly = initialReadonly;
    return { initialDisabled, initialReadonly };
  }

  /**
   * 初始化 DOM 结构 / Initialize DOM structure
   */
  private initDOM(el: HTMLElement, options: EditorOptions): void {
    this.currentLocale = options.locale || "zh-CN";

    this.root = document.createElement("div");
    this.root.className = "free-editor__container";

    this.content = document.createElement("div");
    this.content.className = "free-editor__content";
    this.root.appendChild(this.content);
    el.appendChild(this.root);

    this.setTheme(options.theme || "light");
  }

  /**
   * 初始化编辑器核心 / Initialize editor core
   */
  private initEditor(options: EditorOptions): void {
    this.pluginResult = createEditorPlugins({
      include: options.include || [],
      exclude: options.exclude || [],
      placeholder: options.placeholder,
      uploader: options.uploader,
    });

    this.editor = new TiptapEditor({
      element: this.content as HTMLDivElement,
      content: options.content || "",
      extensions: this.pluginResult.extensions,
      editorProps: this.pluginResult.editorProps,
    });

    this.toolbar = createToolbar(this.editor, this.pluginResult.toolbars);
    this.root.prepend(this.toolbar);

    const cleanup = this.pluginResult.setup(this.editor, this.root);
    this.destroyHooks.push(cleanup);

    /** 标记最近一次指针按下是否发生在内容区 */
    let pointerDownInContent = false;

    /** 点击内容区：记录按下起点并确保聚焦 */
    const handleContentPointerDown = (): void => {
      pointerDownInContent = true;
      // 已聚焦时再次点击内容区，ProseMirror 可能瞬断失焦并被下面的守卫恢复，
      // 因此在该点击后的短窗口内抑制 onBlur/onFocus 派发，把瞬断视为一直聚焦，避免重复回调。
      if (this.editor.isFocused) {
        this.focusGuardSuppressUntil =
          performance.now() + FOCUS_EVENT_SUPPRESS_WINDOW;
      }
      ensureEditorFocus(this.editor);
    };

    /**
     * 焦点守卫 / Focus guard
     * ProseMirror 对空文档或无有效选区变化的再次点击会主动 blur，导致焦点回落到 body。
     * 仅当本次点击起点在内容区、且点击后没有任何元素接住焦点时恢复编辑器焦点，
     */
    const handleContentPointerUp = (): void => {
      if (!pointerDownInContent) return;
      pointerDownInContent = false;
      if (document.activeElement === document.body) {
        this.editor.commands.focus();
      }
    };

    this.content.addEventListener("pointerdown", handleContentPointerDown);
    this.content.addEventListener("pointerup", handleContentPointerUp);
    this.destroyHooks.push(() => {
      this.content.removeEventListener("pointerdown", handleContentPointerDown);
      this.content.removeEventListener("pointerup", handleContentPointerUp);
    });

    this.subscribeChange(options);

    this.subscribeEditorEvents(options);
  }

  /**
   * 注册内容变化回调 / Subscribe to content change callback
   * - 空事务（禁用/只读刷新）docChanged 为 false，直接跳过；
   * - 被标记为非内容的事务（进度条/加载占位/纯上传占位）直接跳过。
   */
  private subscribeChange(options: EditorOptions): void {
    const onChange = options.onChange;
    if (!onChange) return;

    const onUpdate = (props: { transaction?: Transaction }): void => {
      /** 空事务不改变文档内容，直接返回 */
      if (!props.transaction?.docChanged) return;
      /** 上传处标记的非内容刷新（进度条）不触发 */
      if (isNonContentTransaction(props.transaction)) return;
      onChange(this.getHtml());
    };

    this.editor.on("update", onUpdate);
    this.destroyHooks.push(() => {
      this.editor.off("update", onUpdate);
    });
  }

  /**
   * 订阅编辑器事件回调 / Subscribe editor event callbacks
   */
  private subscribeEditorEvents(options: EditorOptions): void {
    this.onDestroyCallback = options.onDestroy;

    let focusHandler: (() => void) | undefined;
    let blurHandler: (() => void) | undefined;
    let selectionHandler: (() => void) | undefined;

    if (options.onFocus) {
      focusHandler = (): void => {
        if (this.shouldSuppressFocusEvents()) return;
        options.onFocus?.();
      };
      this.editor.on("focus", focusHandler);
    }
    if (options.onBlur) {
      blurHandler = (): void => {
        if (this.shouldSuppressFocusEvents()) return;
        options.onBlur?.();
      };
      this.editor.on("blur", blurHandler);
    }
    if (options.onSelectionChange) {
      selectionHandler = (): void => {
        options.onSelectionChange?.();
      };
      this.editor.on("selectionUpdate", selectionHandler);
    }

    this.destroyHooks.push(() => {
      if (focusHandler) {
        this.editor.off("focus", focusHandler);
      }
      if (blurHandler) {
        this.editor.off("blur", blurHandler);
      }
      if (selectionHandler) {
        this.editor.off("selectionUpdate", selectionHandler);
      }
    });
  }

  /**
   * 判断是否处于内容区点击引起的焦点瞬断抑制窗口内
   * Whether inside the focus-transient suppression window
   */
  private shouldSuppressFocusEvents(): boolean {
    return performance.now() < this.focusGuardSuppressUntil;
  }

  /**
   * 初始化媒体引擎 / Initialize media engine
   */
  private initMediaEngine(): void {
    /** 从 editor 实例上获取 mediaEngine（由 setup 函数写入 view） */
    this.mediaEngine =
      ((
        this.editor.view as unknown as {
          editor?: { storage?: { mediaEngine?: MediaEngine } };
        }
      ).editor?.storage?.mediaEngine as MediaEngine | null) || null;

    /** 如果没有通过 storage 拿到，尝试从根容器查找（兜底） */
    if (!this.mediaEngine) {
      const engineOnView = (
        this.editor.view as unknown as { mediaEngine?: MediaEngine }
      ).mediaEngine as MediaEngine | undefined;
      if (engineOnView) this.mediaEngine = engineOnView;
    }
  }

  /**
   * 设置事件拦截 / Set up event blocking
   */
  private setupEventBlocking(): void {
    const blockEvent = (e: Event): boolean => {
      if (this.isDisabled || this.isReadonly) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      return true;
    };

    const onPasteBlock = (e: ClipboardEvent): boolean => blockEvent(e);
    const onDropBlock = (e: DragEvent): boolean => blockEvent(e);
    const onDragOverBlock = (_e: DragEvent): boolean => {
      if (this.isDisabled || this.isReadonly) {
        return true;
      }
      return true;
    };
    const onDragStartBlock = (e: DragEvent): boolean => blockEvent(e);
    const onBeforeInputBlock = (e: InputEvent): boolean => blockEvent(e);

    this.root.addEventListener("paste", onPasteBlock, true);
    this.root.addEventListener("drop", onDropBlock, true);
    this.root.addEventListener("dragover", onDragOverBlock, true);
    this.root.addEventListener("dragstart", onDragStartBlock, true);
    this.root.addEventListener("beforeinput", onBeforeInputBlock, true);

    this.destroyHooks.push(() => {
      this.root.removeEventListener("paste", onPasteBlock, true);
      this.root.removeEventListener("drop", onDropBlock, true);
      this.root.removeEventListener("dragover", onDragOverBlock, true);
      this.root.removeEventListener("dragstart", onDragStartBlock, true);
      this.root.removeEventListener("beforeinput", onBeforeInputBlock, true);
    });
  }

  /**
   * 订阅语言变化 / Subscribe to locale changes
   */
  private subscribeLocale(): void {
    this.unsubscribeLocale = i18n.subscribe(() => {
      this.rebuildToolbar();
      this.refreshPlaceholder();
    });
  }

  /**
   * 初始化高度配置 / Initialize height configuration
   */
  private initHeight(options: EditorOptions): void {
    this.heightOption = options.height;
    this.maxHeightOption = options.maxHeight;
    if (this.heightOption || this.maxHeightOption) {
      this.applyHeightConstraints();
    }
  }

  /**
   * 应用初始禁用/只读状态 / Apply initial disabled/readonly states
   */
  private applyInitialStates(
    initialDisabled: boolean,
    initialReadonly: boolean,
  ): void {
    if (initialDisabled) {
      this.setDisabled(true);
    }
    if (initialReadonly) {
      this.setReadonly(true);
    }
  }

  /**
   * 获取编辑器是否已挂载 / Get whether the editor is mounted
   * @returns 是否已挂载 / Whether mounted
   */
  get isMounted(): boolean {
    return this.mounted;
  }

  /**
   * 获取编辑器是否已销毁 / Get whether the editor is destroyed
   * @returns 是否已销毁 / Whether destroyed
   */
  get isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * 获取当前主题 / Get current theme
   * @returns 当前主题 / Current theme
   */
  get theme(): EditorTheme {
    return (document.documentElement.dataset.theme as EditorTheme) || "light";
  }

  /**
   * 是否为深色模式 / Whether it is dark mode
   * @returns 是否为深色模式 / Whether dark mode
   */
  get isDark(): boolean {
    return this.theme === "dark";
  }

  /**
   * 设置主题 / Set theme
   * @param theme - 主题名称 / Theme name
   */
  setTheme(theme: EditorTheme): void {
    if (this.destroyed) {
      return;
    }

    document.documentElement.dataset.theme = theme;
  }

  /**
   * 切换主题 / Toggle theme
   */
  toggleTheme(): void {
    this.setTheme(this.isDark ? "light" : "dark");
  }

  /**
   * 获取当前语言 / Get current locale
   * @returns 当前语言 / Current locale
   */
  get locale(): Locale {
    return this.currentLocale;
  }

  /**
   * 设置语言 / Set locale
   * @param locale - 语言 / Locale
   */
  setLocale(locale: Locale): void {
    if (this.destroyed) {
      return;
    }

    if (this.currentLocale === locale) {
      return;
    }

    this.currentLocale = locale;
    // [I18N] 发布语言变化通知
    i18n.setLocale(locale);
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
   * @param disabled - 是否禁用 / Whether disabled
   */
  setDisabled(disabled: boolean): void {
    if (this.destroyed) {
      return;
    }

    if (this.isDisabled === disabled) {
      return;
    }

    this.isDisabled = disabled;

    /** 同步全局运行时状态（ProseMirror editorProps 层立即生效） */
    editorRuntimeState.disabled = disabled;

    /** 同步媒体引擎禁用状态（阻止拖拽/粘贴上传） */
    this.syncMediaEngineDisabled();

    /** 同步工具栏状态（禁用模式下工具栏可见但交互锁住，防止用户点击工具栏按钮） */
    this.syncToolbarState();

    /** 同步容器级别的样式和阻止行为（禁用模式下仍显示工具栏，只阻止操作） */
    this.syncContainerState();

    /** 同步媒体节点禁用状态（禁用/只读时移除调整大小手柄） */
    this.syncMediaNodeState();

    /** 强制触发一次编辑器视图刷新（确保 editable 判定重新计算） */
    this.forceRefreshView();
  }

  /**
   * 设置只读状态（动态切换） / Set readonly state (dynamic toggle)
   * @param readonly - 是否只读 / Whether readonly
   */
  setReadonly(readonly: boolean): void {
    if (this.destroyed) {
      return;
    }

    if (this.isReadonly === readonly) {
      return;
    }

    this.isReadonly = readonly;

    /** 同步全局运行时状态（ProseMirror editorProps 层立即生效） */
    editorRuntimeState.readonly = readonly;

    /** 同步媒体引擎禁用状态（阻止拖拽/粘贴上传） */
    this.syncMediaEngineDisabled();

    /** 同步工具栏状态（只读时工具栏完全隐藏，且交互禁用） */
    this.syncToolbarState();

    /** 同步容器级别的样式和行为） */
    this.syncContainerState();

    /** 同步媒体节点禁用状态（禁用/只读时移除调整大小手柄） */
    this.syncMediaNodeState();

    /** 强制触发一次编辑器视图刷新（确保 editable 判定重新计算） */
    this.forceRefreshView();
  }

  /**
   * 同步媒体引擎的禁用状态 / Sync media engine disabled state
   * 当禁用或只读时，媒体引擎全部禁止粘贴/拖拽回调（避免触发上传）
   */
  private syncMediaEngineDisabled(): void {
    if (!this.mediaEngine) {
      this.mediaEngine =
        (this.editor.storage?.mediaEngine as MediaEngine | null) || null;
    }

    if (this.mediaEngine) {
      this.mediaEngine.setDisabled(this.isDisabled || this.isReadonly);
    }
  }

  /**
   * 同步工具栏的显示与交互禁用状态 / Sync toolbar visibility + interactive disabled state
   * - 只读：工具栏完全隐藏（display:none）且交互禁用
   * - 禁用：工具栏可见但交互禁用（pointer-events: none + 子元素 disabled + 视觉灰显）
   * - 正常：工具栏显示且可交互
   */
  private syncToolbarState(): void {
    if (!this.toolbar) {
      return;
    }

    const readonly = this.isReadonly;
    const disabled = this.isDisabled;
    const toolbar = this.toolbar;

    /** 显示/隐藏（只读时完全隐藏） */
    if (readonly) {
      toolbar.style.display = "none";
    } else {
      toolbar.style.display = "";
    }

    /** 交互禁用 */
    const shouldLock = disabled || readonly;
    if (shouldLock) {
      toolbar.style.pointerEvents = "none";
      toolbar.classList.add("free-editor__toolbar--disabled");
      toolbar.setAttribute("aria-disabled", "true");
      toolbar.setAttribute("data-toolbar-disabled", "true");

      /** 遍历所有可交互子元素：设置 disabled 属性 + 视觉提示 */
      const interactives = toolbar.querySelectorAll<
        HTMLElement & { disabled?: boolean }
      >(
        [
          "button",
          "select",
          "textarea",
          "input",
          '[role="button"]',
          '[role="combobox"]',
          ".free-editor__toolbar__item",
        ].join(","),
      );
      interactives.forEach((el) => {
        el.setAttribute("data-editor-disabled", "true");
        if (
          el.tagName === "BUTTON" ||
          el.tagName === "SELECT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "INPUT"
        ) {
          (el as HTMLButtonElement).disabled = true;
        }
      });
    } else {
      toolbar.style.pointerEvents = "";
      toolbar.classList.remove("free-editor__toolbar--disabled");
      toolbar.removeAttribute("aria-disabled");
      toolbar.removeAttribute("data-toolbar-disabled");

      /** 恢复子元素的 disabled */
      const interactives = toolbar.querySelectorAll<
        HTMLElement & { disabled?: boolean }
      >('[data-editor-disabled="true"]');
      interactives.forEach((el) => {
        el.removeAttribute("data-editor-disabled");
        if (
          el.tagName === "BUTTON" ||
          el.tagName === "SELECT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "INPUT"
        ) {
          (el as HTMLButtonElement).disabled = false;
        }
      });
    }
  }

  /**
   * 同步容器的状态样式和额外事件拦截 / Sync container state style and extra event interception
   */
  private syncContainerState(): void {
    if (!this.root) {
      return;
    }

    const shouldBlock = this.isDisabled || this.isReadonly;

    /** 添加/移除 容器上的禁用标识类 */
    if (shouldBlock) {
      this.root.classList.add("free-editor--blocked");
      this.root.setAttribute("data-blocked", "true");
    } else {
      this.root.classList.remove("free-editor--blocked");
      this.root.removeAttribute("data-blocked");
    }

    /** 同步悬浮工具栏（禁用/只读时隐藏并停止自动刷新，恢复时重新开启） */
    const floatingToolbar = this.editor.storage.floatingToolbar as
      | FloatingToolbarAPI
      | undefined;
    if (floatingToolbar) {
      if (shouldBlock) {
        floatingToolbar.setAutoRefresh(false);
        floatingToolbar.hide();
      } else {
        floatingToolbar.setAutoRefresh(true);
      }
    }
  }

  /**
   * 同步媒体节点状态（禁用/只读时移除调整大小手柄和选中样式）
   * Sync media node state (remove resize handles and selected style when disabled/readonly)
   */
  private syncMediaNodeState(): void {
    if (!this.root) return;

    const shouldBlock = this.isDisabled || this.isReadonly;
    if (!shouldBlock) return;

    this.root
      .querySelectorAll(".free-editor__media-resizer")
      .forEach((resizer) => {
        /** 移除调整大小手柄 */
        resizer
          .querySelectorAll(".free-editor__resize-handle")
          .forEach((h) => h.remove());
        /** 移除选中样式 */
        resizer.classList.remove("free-editor__selected");
      });
  }

  /**
   * 刷新占位符显示 / Refresh placeholder display
   */
  private refreshPlaceholder(): void {
    const editor = this.editor;
    if (!editor || editor.isDestroyed) {
      return;
    }

    const { state, view } = editor;
    view.dispatch(state.tr);
  }

  /**
   * 强制刷新编辑器视图 / Force refresh editor view
   *
   * 可编辑状态的唯一同步出口：
   * - editor.setEditable()：同步 Tiptap 内部 editable 选项
   * - 空事务派发：让 ProseMirror 依据 editorProps.editable 判定重算 contenteditable
   * - contenteditable 属性兜底：确保对所有浏览器生效
   */
  private forceRefreshView(): void {
    const editor = this.editor;
    if (!editor || editor.isDestroyed) {
      return;
    }

    try {
      const shouldEdit = !this.isDisabled && !this.isReadonly;

      /** 官方 API：同步 Tiptap 内部 editable 选项 */
      editor.setEditable(shouldEdit);

      const { state, view } = editor;
      /** 派发一个空事务，触发编辑器重绘与属性重估 */
      view.dispatch(state.tr);

      /** contenteditable 属性兜底（防止极端情况） */
      const dom = view.dom as HTMLElement | null | undefined;
      if (dom) {
        const value = shouldEdit ? "true" : "false";
        dom.setAttribute("contenteditable", value);
        try {
          dom.contentEditable = value;
        } catch (_e) {
          /* ignore */
        }
      }
    } catch (_e) {
      /* 忽略强制刷新异常 */
    }
  }

  /**
   * 应用高度约束 / Apply height constraints
   * 根据传入的 height / maxHeight 配置，设置根容器和内容区的高度，
   * 并监听工具栏高度变化，实时更新编辑区可用高度。
   */
  private applyHeightConstraints(): void {
    if (this.heightOption) {
      this.root.style.height = `${this.heightOption}px`;
    }
    if (this.maxHeightOption) {
      this.root.style.maxHeight = `${this.maxHeightOption}px`;
      this.root.style.overflow = "hidden";
    }

    /** 内容区超出时显示滚动条 */
    this.content.style.overflowY = "auto";

    /** 初始计算内容区高度 */
    this.updateContentHeight();

    /** 监听工具栏高度变化，实时更新内容区高度 */
    this.toolbarObserver = new ResizeObserver(() => {
      this.updateContentHeight();
    });
    this.toolbarObserver.observe(this.toolbar);
    this.destroyHooks.push(() => {
      this.toolbarObserver?.disconnect();
      this.toolbarObserver = null;
    });
  }

  /**
   * 更新内容区高度 / Update content area height
   * 根据工具栏当前高度重新计算内容区可用高度。
   * - 固定高度模式（height）：内容区高度 = 总高度 - 工具栏高度
   * - 最大高度模式（maxHeight）：内容区最大高度 = 最大总高度 - 工具栏高度
   */
  private updateContentHeight(): void {
    if (!this.toolbar || !this.content) return;
    if (!this.heightOption && !this.maxHeightOption) return;

    const toolbarH = this.toolbar.offsetHeight;

    if (this.heightOption) {
      this.content.style.height = `${Math.max(this.heightOption - toolbarH, 0)}px`;
    } else if (this.maxHeightOption) {
      this.content.style.maxHeight = `${Math.max(this.maxHeightOption - toolbarH, 0)}px`;
    }
  }

  /**
   * 重新构建工具栏 / Rebuild toolbar
   */
  private rebuildToolbar(): void {
    if (!this.toolbar || !this.root) {
      return;
    }

    const oldToolbar = this.toolbar;
    this.toolbar = createToolbar(this.editor, this.pluginResult.toolbars);
    this.root.replaceChild(this.toolbar, oldToolbar);

    /** 重建工具栏后同步显示与交互状态 */
    this.syncToolbarState();

    /** 重建工具栏后重新连接高度监听并更新内容区高度 */
    if (this.toolbarObserver) {
      this.toolbarObserver.disconnect();
      this.toolbarObserver.observe(this.toolbar);
    }
    this.updateContentHeight();
  }

  /**
   * 获取 HTML 内容 / Get HTML content
   * @returns HTML 字符串 / HTML string
   */
  getHtml(): string {
    if (this.destroyed) {
      throw new Error("Editor has been destroyed");
    }

    return this.editor.getHTML();
  }
  /**
   * 设置编辑器内容 / Set editor content
   * @param html - HTML 字符串 / HTML string
   */
  setHtml(html?: string): void {
    if (this.destroyed) {
      throw new Error("Editor has been destroyed");
    }

    this.editor.commands.setContent(html ?? "", { emitUpdate: true });
  }

  /**
   * 聚焦编辑器 / Focus the editor
   */
  focus(): void {
    if (this.destroyed) {
      throw new Error("Editor has been destroyed");
    }

    this.editor.commands.focus();
  }
  /**
   * 失去焦点编辑器 / Blur the editor
   */
  blur(): void {
    if (this.destroyed) {
      throw new Error("Editor has been destroyed");
    }

    this.editor.commands.blur();
  }

  /**
   * 获取当前选中（高亮）文本 / Get the currently selected text
   * @returns 选区内的纯文本，未选中时返回空字符串 / Plain text in selection, empty string if no selection
   */
  getSelectedText(): string {
    if (this.destroyed) {
      throw new Error("Editor has been destroyed");
    }

    const { state } = this.editor;
    return state.doc.textBetween(
      state.selection.from,
      state.selection.to,
      "\n",
    );
  }

  /**
   * 获取纯文本内容 / Get plain text content
   * @returns 去掉 HTML 标签后的纯文本 / Plain text without HTML tags
   */
  getText(): string {
    if (this.destroyed) {
      throw new Error("Editor has been destroyed");
    }

    const { state } = this.editor;
    return state.doc.textBetween(0, state.doc.content.size, "\n");
  }

  /**
   * 获取字符数 / Get character count
   * @returns 纯文本字符数（含空白与换行）/ Plain text character count (includes whitespace and newlines)
   */
  getCharacterCount(): number {
    return this.getText().length;
  }

  /**
   * 暂停播放编辑器内全部视频 / Pause all videos in the editor
   * @returns 暂停结果 / Pause result：
   * - `state` 是否全部成功暂停 / whether all videos paused successfully
   * - `total` 编辑器内视频总数 / total number of videos in the editor
   */
  pauseAllVideos(): { state: boolean; total: number } {
    if (this.destroyed) {
      throw new Error("Editor has been destroyed");
    }

    return this.pauseAllVideosInternal();
  }

  /**
   * 暂停全部视频的内部实现 / Internal implementation of pausing all videos
   * @returns 暂停结果 / Pause result
   */
  private pauseAllVideosInternal(): { state: boolean; total: number } {
    const videos = Array.from(
      this.root.querySelectorAll("video"),
    ) as HTMLVideoElement[];
    const total = videos.length;
    let state = true;

    videos.forEach((video) => {
      try {
        video.pause();
      } catch (_e) {
        /* 单个视频暂停失败不阻断其余视频 */
        state = false;
      }
    });

    return { state, total };
  }

  /**
   * 获取 JSON 内容 / Get JSON content
   * @returns ProseMirror JSON 文档对象 / ProseMirror JSON document object
   */
  getJson(): JSONContent {
    if (this.destroyed) {
      throw new Error("Editor has been destroyed");
    }

    return this.editor.getJSON();
  }
  /**
   * 销毁编辑器 / Destroy editor
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.mounted = false;

    // 释放实例计数：当最后一个编辑器销毁后，若有新编辑器创建可重新认领全局语言
    editorRuntimeState.activeEditorCount = Math.max(
      editorRuntimeState.activeEditorCount - 1,
      0,
    );

    this.unsubscribeLocale?.();
    this.unsubscribeLocale = null;
    this.destroyHooks.forEach((fn) => fn());
    this.destroyHooks = [];
    this.pauseAllVideosInternal();
    this.editor.destroy();

    this.root.remove();

    /** 资源清理完成后触发销毁回调 */
    this.onDestroyCallback?.();
    this.onDestroyCallback = undefined;
  }
}
