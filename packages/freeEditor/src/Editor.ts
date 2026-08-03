import { createToolbar } from "./ui/toolbar/index";
import { createEditorPlugins, CoreEditor } from "./core/editorPlugins";
import { editorRuntimeState } from "./core/editorRuntimeState";
import { i18n } from "./core/index";
import type { MediaEngine } from "./core/utils/index";

import type {
  CreateEditorPluginsResult,
  EditorOptions,
  EditorTheme,
  FloatingToolbarAPI,
  Locale,
} from "./core/types/index";

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
  private root: HTMLElement;

  /**
   * 工具栏元素 / Toolbar element
   */
  private toolbar: HTMLElement;

  /**
   * 内容区域元素 / Content area element
   */
  private content: HTMLElement;

  /**
   * 核心编辑器实例 / Core editor instance
   */
  private core: CoreEditor;

  /**
   * 插件创建结果 / Plugin creation result
   */
  private pluginResult: CreateEditorPluginsResult;

  /**
   * 销毁钩子函数数组 / Array of destroy hook functions
   */
  private destroyHooks: (() => void)[] = [];

  /**
   * 当前语言 / Current locale
   */
  private currentLocale: Locale;

  /**
   * 取消语言变化订阅 / Unsubscribe locale change
   */
  private unsubscribeLocale: (() => void) | null = null;

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
    /** 先同步一次 runtimeState，确保 CoreEditor 初始化时 editorProps.editable 就返回正确值 */
    const initialDisabled = Boolean(options.disabled);
    const initialReadonly = Boolean(options.readonly);
    editorRuntimeState.disabled = initialDisabled;
    editorRuntimeState.readonly = initialReadonly;

    this.currentLocale = options.locale || "zh-CN";
    // [I18N] 发布语言变化通知
    i18n.setLocale(this.currentLocale);
    this.root = document.createElement("div");
    this.root.className = "free-editor__container";

    this.content = document.createElement("div");
    this.content.className = "free-editor__content";

    this.root.appendChild(this.content);
    el.appendChild(this.root);

    this.setTheme(options.theme || "light");

    this.pluginResult = createEditorPlugins({
      include: options.include || [],
      exclude: options.exclude || [],
      placeholder: options.placeholder,
      uploader: options.uploader,
    });

    this.core = new CoreEditor(this.content, {
      content: options.content,
      extensions: this.pluginResult.extensions,
      editorProps: this.pluginResult.editorProps,
    });

    this.toolbar = createToolbar(this.core.editor, this.pluginResult.toolbars);
    this.root.prepend(this.toolbar);

    const cleanup = this.pluginResult.setup(this.core.editor, this.root);
    this.destroyHooks.push(cleanup);

    /** 从 editor 实例上获取 mediaEngine（由 setup 函数写入 view） */
    this.mediaEngine =
      ((this.core.editor.view as any).editor?.storage
        ?.mediaEngine as MediaEngine | null) || null;

    /** 如果没有通过 storage 拿到，尝试从根容器查找（兜底） */
    if (!this.mediaEngine) {
      const engineOnView = (this.core.editor.view as any).mediaEngine as
        | MediaEngine
        | undefined;
      if (engineOnView) this.mediaEngine = engineOnView;
    }

    /** 容器级别的事件拦截（防御性阻止禁用/只读下的 paste/drop） */
    const blockEvent = (e: Event) => {
      if (this.isDisabled || this.isReadonly) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      return true;
    };

    const onPasteBlock = (e: ClipboardEvent) => blockEvent(e);
    const onDropBlock = (e: DragEvent) => blockEvent(e);
    const onDragOverBlock = (e: DragEvent) => {
      if (this.isDisabled || this.isReadonly) {
        return true; /** 不阻止默认行为（允许系统默认拖拽行为），但不触发上传 */
      }
      return true;
    };
    const onDragStartBlock = (e: DragEvent) => blockEvent(e);
    const onBeforeInputBlock = (e: InputEvent) => blockEvent(e);

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

    // [I18N] 订阅语言变化
    this.unsubscribeLocale = i18n.subscribe(() => {
      this.rebuildToolbar();
      this.refreshPlaceholder();
    });

    /** 应用高度配置 */
    this.heightOption = options.height;
    this.maxHeightOption = options.maxHeight;
    if (this.heightOption || this.maxHeightOption) {
      this.applyHeightConstraints();
    }

    this.mounted = true;

    /** 应用初始禁用/只读状态 */
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
  get isMounted() {
    return this.mounted;
  }

  /**
   * 获取编辑器是否已销毁 / Get whether the editor is destroyed
   * @returns 是否已销毁 / Whether destroyed
   */
  get isDestroyed() {
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
  get isDark() {
    return this.theme === "dark";
  }

  /**
   * 设置主题 / Set theme
   * @param theme - 主题名称 / Theme name
   */
  setTheme(theme: EditorTheme) {
    if (this.destroyed) {
      return;
    }

    document.documentElement.dataset.theme = theme;
  }

  /**
   * 切换主题 / Toggle theme
   */
  toggleTheme() {
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
  setLocale(locale: Locale) {
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
  setDisabled(disabled: boolean) {
    if (this.destroyed) {
      return;
    }

    if (this.isDisabled === disabled) {
      return;
    }

    this.isDisabled = disabled;

    /** 同步全局运行时状态（ProseMirror editorProps 层立即生效） */
    editorRuntimeState.disabled = disabled;

    /** 同步核心编辑器禁用状态（同步内容编辑权限） */
    this.core.setDisabled(disabled);

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
  setReadonly(readonly: boolean) {
    if (this.destroyed) {
      return;
    }

    if (this.isReadonly === readonly) {
      return;
    }

    this.isReadonly = readonly;

    /** 同步全局运行时状态（ProseMirror editorProps 层立即生效） */
    editorRuntimeState.readonly = readonly;

    /** 同步核心编辑器只读状态（同步内容编辑权限） */
    this.core.setReadonly(readonly);

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
  private syncMediaEngineDisabled() {
    if (!this.mediaEngine) {
      this.mediaEngine =
        ((this.core.editor as any).storage
          ?.mediaEngine as MediaEngine | null) || null;
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
  private syncToolbarState() {
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
  private syncContainerState() {
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
    const floatingToolbar = this.core.editor.storage.floatingToolbar as
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
  private syncMediaNodeState() {
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
  private refreshPlaceholder() {
    const editor = this.core.editor;
    if (!editor || editor.isDestroyed) {
      return;
    }

    const { state, view } = editor;
    view.dispatch(state.tr);
  }

  /**
   * 强制刷新编辑器视图（触发一次空事务让 ProseMirror 重新计算 editable/选区等）
   */
  private forceRefreshView() {
    const editor = this.core.editor;
    if (!editor || editor.isDestroyed) {
      return;
    }

    try {
      const { state, view } = editor;
      /** 派发一个空事务，触发编辑器重绘与属性重估 */
      view.dispatch(state.tr);

      /** 再触发一次可编辑 DOM 属性兜底（防止极端情况） */
      const dom = view.dom as HTMLElement | null | undefined;
      if (dom) {
        const shouldEdit = !this.isDisabled && !this.isReadonly;
        const value = shouldEdit ? "true" : "false";
        dom.setAttribute("contenteditable", value);
        try {
          (dom as any).contentEditable = value;
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
  private applyHeightConstraints() {
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
  private updateContentHeight() {
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
  private rebuildToolbar() {
    if (!this.toolbar || !this.root) {
      return;
    }

    const oldToolbar = this.toolbar;
    this.toolbar = createToolbar(this.core.editor, this.pluginResult.toolbars);
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
  getHtml() {
    if (this.destroyed) {
      throw new Error("Editor has been destroyed");
    }

    return this.core.getHtml();
  }
  /**
   * 获取 JSON 内容 / Get JSON content
   * @returns JSON 字符串 / JSON string
   */
  getJson() {
    if (this.destroyed) {
      throw new Error("Editor has been destroyed");
    }

    return this.core.getJson();
  }
  /**
   * 销毁编辑器 / Destroy editor
   */
  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.mounted = false;

    this.unsubscribeLocale?.();
    this.unsubscribeLocale = null;

    this.destroyHooks.forEach((fn) => fn());
    this.destroyHooks = [];

    this.core.destroy();

    this.root.remove();
  }
}
