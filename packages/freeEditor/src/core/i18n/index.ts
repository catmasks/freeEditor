import zhCN from "./locales/zh-CN";
import en from "./locales/en";
import jaJP from "./locales/ja-JP";

import type { Locale } from "../types/index";

export type LocaleMessages = typeof zhCN;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type LocaleRegistry = Record<string, LocaleMessages>;

/**
 * 深度合并两个对象，source 中存在的属性会覆盖 target 中对应的属性。
 *
 * Deeply merges two objects, where properties from source override
 * the corresponding properties in target.
 *
 * @param target 目标对象 / Target object
 * @param source 源对象 / Source object
 * @returns 合并后的对象 / The merged object
 */
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];

    if (sourceValue === undefined || sourceValue === null) {
      continue;
    }

    const targetValue = result[key];

    if (
      typeof sourceValue === "object" &&
      !Array.isArray(sourceValue) &&
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue)
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        targetValue as object,
        sourceValue as object,
      );
    } else {
      (result as Record<string, unknown>)[key] = sourceValue;
    }
  }

  return result;
}

/**
 * 根据点路径从对象中获取字符串值。
 *
 * Gets a string value from an object using a dot-separated path.
 *
 * @param obj 目标对象 / Target object
 * @param path 属性路径，例如 "toolbar.bold" / Property path, e.g. "toolbar.bold"
 * @returns 对应的字符串，不存在时返回 undefined / The string value, or undefined if not found
 */
function getByPath(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" ? current : undefined;
}

class I18nStore {
  /**
   * 当前语言标识 / Current locale identifier
   */
  private _locale: Locale = "zh-CN";

  /**
   * 语言包注册表 / Locale registry
   */
  private _locales: LocaleRegistry = {
    "zh-CN": zhCN,
    en,
    "ja-JP": jaJP,
  };

  /**
   * 当前最终使用的消息对象 / Current final message object
   */
  private _messages: LocaleMessages = this._locales["zh-CN"];

  /**
   * 订阅者集合 / Set of subscribers
   */
  private _subscribers: Set<(locale: Locale) => void> = new Set();

  /**
   * 获取当前语言标识。
   *
   * Gets the current locale identifier.
   *
   * @returns 当前语言 / Current locale
   */
  get locale(): Locale {
    return this._locale;
  }

  /**
   * 获取所有已经注册的语言标识。
   *
   * Gets all registered locale identifiers.
   *
   * @returns 已注册的语言列表 / List of registered locales
   */
  getLocales(): Locale[] {
    return Object.keys(this._locales) as Locale[];
  }

  /**
   * 判断指定语言是否已经注册。
   *
   * Checks whether the specified locale has been registered.
   *
   * @param locale 语言标识 / Locale identifier
   * @returns 是否已注册 / Whether the locale is registered
   */
  hasLocale(locale: Locale): boolean {
    return Object.prototype.hasOwnProperty.call(this._locales, locale);
  }

  /**
   * 获取指定语言的原始消息对象。
   *
   * Gets the original message object for the specified locale.
   *
   * 注意：返回的是原始语言包，不包含 extend() 对当前消息的扩展。
   *
   * Note: Returns the original locale messages without extensions
   * applied by extend() to the current messages.
   *
   * @param locale 语言标识 / Locale identifier
   * @returns 原始消息对象，不存在时返回 undefined /
   * The original message object, or undefined if not registered
   */
  getMessages(locale: Locale): LocaleMessages | undefined {
    return this._locales[locale];
  }

  /**
   * 获取当前最终使用的消息对象。
   *
   * Gets the final message object currently being used.
   *
   * 该对象包含当前语言通过 extend() 添加的扩展内容。
   *
   * This object includes extensions added to the current locale
   * through extend().
   *
   * @returns 当前最终消息对象 / Current final message object
   */
  getCurrentMessages(): LocaleMessages {
    return this._messages;
  }

  /**
   * 注册新的语言消息。
   *
   * Registers a new locale and its messages.
   *
   * 已经注册的语言不能重复添加，包括内置语言和自定义语言。
   *
   * An already registered locale cannot be added again,
   * including both built-in and custom locales.
   *
   * @param locale 新语言标识 / New locale identifier
   * @param messages 语言消息对象 / Locale message object
   * @throws 当语言已经注册时抛出异常 /
   * Throws an error if the locale has already been registered
   */
  addMessages(locale: Locale, messages: LocaleMessages): void {
    if (this.hasLocale(locale)) {
      throw new Error(
        `语言 "${locale}" 已经注册，不能重复添加。` +
          ` Locale "${locale}" is already registered and cannot be added again.`,
      );
    }

    this._locales[locale] = messages;

    if (this._locale === locale) {
      this._messages = { ...messages };
      this._publish();
    }
  }

  /**
   * 设置当前语言。
   *
   * Sets the current locale.
   *
   * 只有已经注册的语言才能被切换。
   *
   * Only registered locales can be selected.
   *
   * @param locale 目标语言 / Target locale
   */
  setLocale(locale: Locale): void {
    const messages = this._locales[locale];

    if (!messages) {
      throw new Error(
        `语言 "${locale}" 未注册，不能切换。` +
          ` Locale "${locale}" is not registered and cannot be switched.`,
      );
    }

    if (this._locale === locale) {
      return;
    }

    this._locale = locale;
    this._messages = { ...messages };

    this._publish();
  }

  /**
   * 获取指定语言的翻译文本。
   *
   * Gets the translated text for the specified message key.
   *
   * 支持点路径和参数占位符，例如 "toolbar.bold" 和 "{0}"。
   *
   * Supports dot-separated paths and parameter placeholders,
   * such as "toolbar.bold" and "{0}".
   *
   * @param key 消息键 / Message key
   * @param args 占位符参数 / Placeholder arguments
   * @returns 翻译文本，找不到时返回 key /
   * Translated text, or the key itself if not found
   */
  t(key: string, ...args: unknown[]): string {
    const value = getByPath(this._messages, key);

    if (value === undefined) {
      return key;
    }

    if (args.length === 0) {
      return value;
    }

    return value.replace(/\{(\d+)\}/g, (_, index: string) => {
      const position = Number.parseInt(index, 10);

      return args[position] != null ? String(args[position]) : "";
    });
  }

  /**
   * 扩展当前语言的消息。
   *
   * Extends the messages of the current locale.
   *
   * 该方法不会修改原始语言包，只会修改当前最终使用的消息对象。
   *
   * This method does not modify the original locale messages.
   * It only modifies the final messages currently being used.
   *
   * @param messages 扩展消息 / Message extensions
   */
  extend(messages: DeepPartial<LocaleMessages>): void {
    this._messages = deepMerge(this._messages, messages);

    this._publish();
  }

  /**
   * 订阅语言变化事件。
   *
   * Subscribes to locale change events.
   *
   * @param callback 语言变化回调 / Locale change callback
   * @returns 取消订阅函数 / Unsubscribe function
   */
  subscribe(callback: (locale: Locale) => void): () => void {
    this._subscribers.add(callback);

    return () => {
      this._subscribers.delete(callback);
    };
  }

  /**
   * 发布当前语言变化事件。
   *
   * Publishes the current locale change event.
   *
   * Notifies all registered subscribers of the current locale.
   */
  private _publish(): void {
    this._subscribers.forEach((callback) => {
      callback(this._locale);
    });
  }
}

export const i18n = new I18nStore();

export { zhCN, en, jaJP };
