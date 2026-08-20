import type { Editor, AnyExtension } from "@tiptap/core";
import type { EditorProps } from "@tiptap/pm/view";

import type {
  EditorPlugin,
  CreateEditorPluginsResult,
  CreateEditorPluginsOptions,
} from "./types/index";

import { MediaEngine, useMediaUploader } from "./utils/index";
import { editorRuntimeState } from "./editorRuntimeState";
import Gapcursor from "@tiptap/extension-gapcursor";

import {
  CustomDocument,
  CustomParagraph,
  CustomText,
  ListItem,
  TaskItem,
  FloatingToolbarPlugin,
  PlaceholderPlugin,
  EmptyTextSelectionFix,
} from "../preset/index";

import {
  BoldPlugin,
  ItalicPlugin,
  HeadingPlugin,
  CodeBlockPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
  AlignmentPlugin,
  LineHeightPlugin,
  LinkPlugin,
  FontColorPlugin,
  FontHighlightPlugin,
  ImagePlugin,
  VideoPlugin,
  AttachmentPlugin,
  UnderlinePlugin,
  StrikePlugin,
  SuperscriptPlugin,
  SubscriptPlugin,
  BulletListPlugin,
  OrderedListPlugin,
  IndentPlugin,
  OutdentPlugin,
  LineBreakPlugin,
  BlockquotePlugin,
  TaskListPlugin,
  DividerPlugin,
  InlineCodePlugin,
  FormatPainterPlugin,
  ClearFormatPlugin,
  UndoPlugin,
  RedoPlugin,
  TablePlugin,
  MarkdownPlugin,
  ExportWordPlugin,
  ImportWordPlugin,
  ExportPdfPlugin,
} from "../preset/index";

/**
 * 编辑器插件注册表 / Editor plugin registry
 */
export const editorPluginRegistry: EditorPlugin[] = [
  UndoPlugin,
  RedoPlugin,
  FormatPainterPlugin,
  ClearFormatPlugin,
  HeadingPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikePlugin,
  SuperscriptPlugin,
  SubscriptPlugin,
  FontColorPlugin,
  FontHighlightPlugin,
  AlignmentPlugin,
  LineHeightPlugin,
  InlineCodePlugin,
  DividerPlugin,
  BlockquotePlugin,
  IndentPlugin,
  OutdentPlugin,
  LineBreakPlugin,
  LinkPlugin,
  CodeBlockPlugin,
  OrderedListPlugin,
  BulletListPlugin,
  TaskListPlugin,
  ImagePlugin,
  VideoPlugin,
  AttachmentPlugin,
  TablePlugin,
  MarkdownPlugin,
  ExportWordPlugin,
  ImportWordPlugin,
  ExportPdfPlugin,
];

/**
 * 创建基础扩展 / Create base extensions
 *
 * 基础 schema 节点和编辑器基础能力
 *
 * @param placeholder 占位符文本 / Placeholder text
 * @returns 基础扩展数组 / Base extensions array
 */
function createBaseExtensions(placeholder?: string): AnyExtension[] {
  return [
    CustomDocument,
    CustomParagraph,
    CustomText,
    ListItem,
    TaskItem,
    Gapcursor,
    EmptyTextSelectionFix,
    PlaceholderPlugin.configure({
      placeholder: placeholder || "",
    }),
    FloatingToolbarPlugin,
  ];
}

/**
 * 编辑器默认行为配置 / Default editor behavior configuration
 *
 * 处理编辑器基础能力:
 *
 * - HTML 粘贴清理
 * - 浏览器 clipboard 兼容
 * - 全局 disable/readonly 生效（通过 runtimeState 动态切换）
 */
const defaultEditorProps: EditorProps = {
  /**
   * 全局可编辑性判定（优先级最高）/ Global editable predicate (highest priority)
   * 只要 disabled || readonly 就返回 false
   */
  editable() {
    return !(editorRuntimeState.disabled || editorRuntimeState.readonly);
  },

  /**
   * 全局粘贴拦截：禁用/只读时直接 return true 表示事件已处理（不再触发上传回调）
   */
  handlePaste(_view, _event, _slice) {
    if (editorRuntimeState.disabled || editorRuntimeState.readonly) {
      return true;
    }
    return false;
  },

  /**
   * 全局拖拽释放拦截：禁用/只读时直接 return true
   */
  handleDrop(_view, _event, _slice, _moved) {
    if (editorRuntimeState.disabled || editorRuntimeState.readonly) {
      return true;
    }
    return false;
  },

  /**
   * 清理粘贴 HTML
   */
  transformPastedHTML(html) {
    const container = document.createElement("div");

    container.innerHTML = html;

    return container.innerHTML.trim();
  },
};

/**
 * 合并 editorProps 配置 / Merge editorProps configuration
 *
 * 不同类型 editorProps 使用不同合并策略:
 *
 * handleXXX:
 * - 任意一个返回 true，停止后续处理
 *
 * transformXXX:
 * - 上一个结果作为下一个输入
 *
 * 普通属性:
 * - 后者覆盖前者
 *
 * @param propsList editorProps 数组 / EditorProps array
 * @returns 合并后的 editorProps / Merged editorProps
 */
/**
 * 事件拦截类型 / Event interception handler keys
 */
const BOOLEAN_HANDLERS = new Set<string>([
  "handlePaste",
  "handleDrop",
  "handleKeyDown",
  "handleKeyPress",
  "handleKeyUp",
  "handleClick",
  "handleDoubleClick",
  "handleDOMEvents",
]);

/**
 * 数据转换类型 / Data transform handler keys
 */
const TRANSFORM_HANDLERS = new Set<string>([
  "transformPastedHTML",
  "transformPastedText",
]);

function mergeEditorProps(propsList: EditorProps[]): EditorProps {
  const result: EditorProps = {};

  for (const props of propsList) {
    for (const key in props) {
      assignMergedProp(result, key, props[key as keyof EditorProps]);
    }
  }

  return result;
}

/**
 * 合并单个 editorProps 键。
 *
 * 抽出自 mergeEditorProps 的每个键处理逻辑，降低主函数认知复杂度。
 */
function assignMergedProp(
  result: EditorProps,
  key: string,
  value: EditorProps[keyof EditorProps] | undefined,
): void {
  const prev = result[key as keyof EditorProps];

  if (typeof prev === "function" && typeof value === "function") {
    /**
     * 事件处理函数合并
     */
    if (BOOLEAN_HANDLERS.has(key)) {
      (result as Record<string, unknown>)[key] = createBooleanHandler(
        prev as (...args: unknown[]) => unknown,
        value as (...args: unknown[]) => unknown,
      );
      return;
    }

    /**
     * 转换函数合并
     */
    if (TRANSFORM_HANDLERS.has(key)) {
      (result as Record<string, unknown>)[key] = createTransformHandler(
        prev as (v: unknown, ...args: unknown[]) => unknown,
        value as (v: unknown, ...args: unknown[]) => unknown,
      );
      return;
    }
  }

  if (value !== undefined) {
    (result as Record<string, unknown>)[key] = value;
  }
}

/**
 * 事件处理函数合并器。
 *
 * 任一处理函数返回 true 则停止后续处理。
 */
function createBooleanHandler(
  prev: (...args: unknown[]) => unknown,
  next: (...args: unknown[]) => unknown,
): (...args: unknown[]) => unknown {
  return (...args: unknown[]): unknown => {
    if (prev(...args) === true) {
      return true;
    }

    return next(...args);
  };
}

/**
 * 数据转换函数合并器。
 *
 * 前一个处理函数的输出作为后一个处理函数的输入。
 */
function createTransformHandler(
  prev: (value: unknown, ...args: unknown[]) => unknown,
  next: (value: unknown, ...args: unknown[]) => unknown,
): (value: unknown, ...args: unknown[]) => unknown {
  return (value: unknown, ...args: unknown[]): unknown => {
    const prevValue = prev(value, ...args);

    return next(prevValue, ...args);
  };
}

/**
 * 创建编辑器插件系统 / Create editor plugin system
 *
 * @param options 创建插件选项 / Plugin creation options
 * @returns 插件系统结果 / Plugin system result
 */
export function createEditorPlugins(
  options: CreateEditorPluginsOptions = {},
): CreateEditorPluginsResult {
  const { include = [], exclude = [], uploader, placeholder } = options;

  const baseExtensions = createBaseExtensions(placeholder);

  /**
   * 所有插件（用于扩展注册，保证被排除插件的标签也能被解析）
   */
  const allPlugins = [...editorPluginRegistry];

  /**
   * 激活插件（用于工具栏、粘贴拖拽、setup）
   */
  let activePlugins = [...editorPluginRegistry];

  if (include.length) {
    activePlugins = activePlugins.filter((p) => include.includes(p.key));
  }

  if (exclude.length) {
    activePlugins = activePlugins.filter((p) => !exclude.includes(p.key));
  }

  /** 同步激活插件列表到运行时状态，供节点视图（如 MediaNodeView）判断是否显示尺寸手柄等 */
  editorRuntimeState.activePluginKeys = new Set(
    activePlugins.map((p) => p.key),
  );

  /**
   * schema 扩展：从所有插件加载，永远注册。
   */
  const schemaExtensions = allPlugins.flatMap((p) => p.schema ?? []);

  /**
   * feature 扩展：只从激活插件加载，受 include/exclude 控制。
   */
  const featureExtensions = activePlugins.flatMap((p) => p.extensions ?? []);

  /**
   * 去重扩展
   */
  const extensionMap = new Map<string, AnyExtension>();

  for (const ext of [
    ...baseExtensions,
    ...schemaExtensions,
    ...featureExtensions,
  ]) {
    extensionMap.set(ext.name, ext);
  }

  const extensions = [...extensionMap.values()];

  /**
   * 工具栏插件
   */
  const toolbars = activePlugins.filter((p) => p.toolbar);

  /**
   * 合并 editorProps（仅激活的插件，排除的插件不注册粘贴/拖拽处理）
   */
  const editorProps = mergeEditorProps([
    defaultEditorProps,

    ...(activePlugins
      .map((p) => p.editorProps)
      .filter(Boolean) as EditorProps[]),
  ]);

  /**
   * 设置编辑器
   *
   * @param editor 编辑器实例
   * @param root 根节点
   */
  function setup(editor: Editor, root?: HTMLElement) {
    if (!editor.storage.mediaUploader) {
      editor.storage.mediaUploader = useMediaUploader(editor, uploader);
    }

    (editor.view as unknown as { editor: Editor }).editor = editor;

    const mediaEngine = root ? new MediaEngine(root) : undefined;

    /** 将 mediaEngine 挂载到 storage，便于主类访问和同步禁用状态 */
    if (mediaEngine) {
      editor.storage.mediaEngine = mediaEngine;
    }

    const cleanups: (() => void)[] = [];

    for (const plugin of activePlugins) {
      const cleanup = plugin.setup?.(editor, {
        uploader,
        mediaEngine,
      });

      if (typeof cleanup === "function") {
        cleanups.push(cleanup);
      }
    }

    return () => {
      mediaEngine?.destroy();

      cleanups.forEach((fn) => fn());
    };
  }

  return {
    extensions,
    toolbars,
    editorProps,
    setup,
  };
}
