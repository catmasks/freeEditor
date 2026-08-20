import type { Transaction } from "@tiptap/pm/state";

/**
 * 非内容刷新事务的 meta 键。
 * Key used to mark a transaction as a non-content refresh.
 *
 * 上传进度条、加载占位、错误占位、纯上传占位等仅刷新界面但不改变最终内容的事务，
 * 通过在该事务上打标记，让 onChange 订阅统一跳过。
 */
export const NON_CONTENT_META = "free-editor.non-content";

/**
 * 标记一个事务为非内容刷新。
 * Mark a transaction as a non-content refresh.
 *
 * @param tr 事务 / Transaction
 * @returns 标记后的事务 / The marked transaction
 */
export function markNonContent(tr: Transaction): Transaction {
  return tr.setMeta(NON_CONTENT_META, true);
}

/**
 * 判断事务是否被标记为非内容刷新。
 * Check whether a transaction is marked as a non-content refresh.
 *
 * @param tr 事务或兼容对象 / Transaction or compatible object
 * @returns 是否非内容刷新 / Whether it is a non-content refresh
 */
export function isNonContentTransaction(
  tr: { getMeta?: (key: string) => unknown } | null | undefined,
): boolean {
  return tr?.getMeta?.(NON_CONTENT_META) === true;
}
