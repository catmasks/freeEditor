import { createToolbar } from "./ui/toolbar/index";
import { createEditorPlugins, CoreEditor } from "./core/editorPlugins";
import { i18n } from "./core/index";

import type {
  CreateEditorPluginsResult,
  EditorOptions,
  EditorTheme,
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
   * 构造函数 / Constructor
   * @param el - 挂载的 DOM 元素 / DOM element to mount
   * @param options - 编辑器配置选项 / Editor configuration options
   */
  constructor(el: HTMLElement, options: EditorOptions = {}) {
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

    // [I18N] 订阅语言变化
    this.unsubscribeLocale = i18n.subscribe(() => {
      this.rebuildToolbar();
      this.refreshPlaceholder();
    });

    this.mounted = true;
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
   * 重新构建工具栏 / Rebuild toolbar
   */
  private rebuildToolbar() {
    if (!this.toolbar || !this.root) {
      return;
    }

    const oldToolbar = this.toolbar;
    this.toolbar = createToolbar(this.core.editor, this.pluginResult.toolbars);
    this.root.replaceChild(this.toolbar, oldToolbar);
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
