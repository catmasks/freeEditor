/**
 * 运行时可写的编辑器全局状态（由 Editor 主类在构造后同步）
 * Runtime writable editor global state
 */
export const editorRuntimeState = {
  /**
   * 是否全局禁用（阻止内容编辑 + 粘贴 + 拖拽上传）
   * Whether globally disabled
   */
  disabled: false,

  /**
   * 是否只读（阻止内容编辑 + 隐藏工具栏 + 禁止粘贴/拖拽上传）
   * Whether readonly
   */
  readonly: false,

  /**
   * 激活的插件键名集合（null 表示无限制，所有插件都可用）
   * Active plugin key set (null means no restriction, all plugins available)
   */
  activePluginKeys: null as Set<string> | null,

  /**
   * 当前存活的编辑器实例数（用于判断是否是首个/唯一编辑器的认领语言）
   * Number of alive editor instances (used to decide locale claiming)
   */
  activeEditorCount: 0,
};