import zhCN from "./locales/zh-CN";
import en from "./locales/en";
import jaJP from "./locales/ja-JP";

export type Locale = "zh-CN" | "en" | "ja-JP";

export type LocaleMessages = typeof zhCN;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

const locales: Record<Locale, LocaleMessages> = {
  "zh-CN": zhCN,
  "en": en,
  "ja-JP": jaJP,
};

let currentLocale: Locale = "zh-CN";
let mergedMessages: LocaleMessages = locales["zh-CN"];
const listeners: Set<(locale: Locale) => void> = new Set();

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
        (result as any)[key] = deepMerge(result[key] as any, source[key] as any);
      } else {
        (result as any)[key] = source[key];
      }
    }
  }
  return result;
}

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

export const i18n = {
  setLocale(locale: Locale) {
    if (locales[locale]) {
      currentLocale = locale;
      mergedMessages = { ...locales[locale] };
      listeners.forEach((fn) => fn(locale));
    }
  },

  getLocale(): Locale {
    return currentLocale;
  },

  getMessages(): LocaleMessages {
    return mergedMessages;
  },

  t(key: string, ...args: any[]): string {
    const value = getByPath(mergedMessages, key);
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
  },

  extend(messages: DeepPartial<LocaleMessages>) {
    mergedMessages = deepMerge(mergedMessages, messages);
    listeners.forEach((fn) => fn(currentLocale));
  },

  onLocaleChange(fn: (locale: Locale) => void): () => void {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

export { zhCN, en, jaJP };
