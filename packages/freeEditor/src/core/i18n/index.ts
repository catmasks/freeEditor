import zhCN from "./locales/zh-CN";
import en from "./locales/en";
import jaJP from "./locales/ja-JP";

export type Locale = "zh-CN" | "en" | "ja-JP";

export type LocaleMessages = typeof zhCN;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 深度合并对象，保留 source 中的属性值
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };
  for (const key in source) {
    if (source[key] !== undefined && source[key] !== null) {
      if (
        typeof source[key] === "object" &&
        !Array.isArray(source[key]) &&
        typeof result[key] === "object" &&
        !Array.isArray(result[key])
      ) {
        (result as any)[key] = deepMerge(
          result[key] as any,
          source[key] as any,
        );
      } else {
        (result as any)[key] = source[key];
      }
    }
  }
  return result;
}

/**
 * 递归根据路径获取对象的属性值
 * @param obj 目标对象
 * @param path 路径字符串，例如 "a.b.c"
 * @returns 目标属性的值
 */
function getByPath(obj: any, path: string): string | undefined {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }
    current = current[key];
  }
  return typeof current === "string" ? current : undefined;
}

/**
 * 国际化存储类（发布-订阅模式）
 *
 * 核心概念：
 * - 发布者：`setLocale` 和 `extend` 会触发语言变化，通知所有订阅者
 * - 订阅者：通过 `subscribe` 注册回调，语言变化时自动执行
 *
 * 使用约定：
 * - 组件初始化时调用 `i18n.subscribe(callback)` 订阅语言变化
 * - 组件销毁时必须调用返回的取消订阅函数，防止内存泄漏
 * - 通过 `i18n.t(key)` 获取翻译文本
 * - 通过 `i18n.setLocale(locale)` 切换语言
 */
class I18nStore {
  /** 当前语言 */
  private _locale: Locale = "zh-CN";

  /** 各语言的原始消息对象 */
  private _locales: Record<Locale, LocaleMessages> = {
    "zh-CN": zhCN,
    en: en,
    "ja-JP": jaJP,
  };

  /** 当前语言合并后的消息对象（包含扩展内容） */
  private _messages: LocaleMessages = this._locales["zh-CN"];

  /** 订阅者集合（Set 防止重复添加） */
  private _subscribers: Set<(locale: Locale) => void> = new Set();

  /**
   * 当前语言
   */
  get locale(): Locale {
    return this._locale;
  }

  /**
   * 翻译函数
   * @param key 消息键，支持点路径格式，例如 "toolbar.bold"
   * @param args 可选参数，用于替换消息中的占位符 {0}, {1}...
   * @returns 翻译后的文本，若未找到则返回 key 本身
   */
  t(key: string, ...args: any[]): string {
    const value = getByPath(this._messages, key);
    if (value == null) {
      return key;
    }
    if (args.length === 0) {
      return value;
    }
    return value.replace(/\{(\d+)\}/g, (_, index) => {
      const i = parseInt(index, 10);
      return args[i] != null ? String(args[i]) : "";
    });
  }

  /**
   * 设置当前语言（发布者）
   * @param locale 目标语言
   */
  setLocale(locale: Locale): void {
    if (!this._locales[locale]) {
      return;
    }
    if (this._locale === locale) {
      return;
    }
    this._locale = locale;
    this._messages = { ...this._locales[locale] };
    this._publish();
  }

  /**
   * 扩展当前语言的消息对象（深度合并）
   * @param messages 扩展的消息对象
   */
  extend(messages: DeepPartial<LocaleMessages>): void {
    this._messages = deepMerge(this._messages, messages);
  }

  /**
   * 订阅语言变化事件
   * 组件销毁时调用返回的取消订阅函数，防止内存泄漏
   * @param callback 语言变化时的回调函数
   * @returns 取消订阅的函数
   */
  subscribe(callback: (locale: Locale) => void): () => void {
    this._subscribers.add(callback);
    return () => {
      this._subscribers.delete(callback);
    };
  }

  /**
   * 发布通知：遍历通知所有订阅者
   */
  private _publish(): void {
    this._subscribers.forEach((callback) => {
      callback(this._locale);
    });
  }
}

/** 全局单例 */
export const i18n = new I18nStore();

export { zhCN, en, jaJP };
