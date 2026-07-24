import type { Editor, AnyExtension } from "@tiptap/core";
import type { EditorProps } from "@tiptap/pm/view";

import type {
  EditorPlugin,
  CreateEditorPluginsResult,
  CreateEditorPluginsOptions,
} from "./types/index";

import { MediaEngine, useMediaUploader } from "./utils/index";
import Gapcursor from "@tiptap/extension-gapcursor";

import { CustomDocument, CustomParagraph, CustomText } from "../preset/index";

import {
  BoldPlugin,
  ItalicPlugin,
  HeadingPlugin,
  PlaceholderPlugin,
  CodeBlockPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
  TextAlignPlugin,
  LinkPlugin,
  FontColorPlugin,
  FontHighlightPlugin,
  ImagePlugin,
  VideoPlugin,
  AttachmentPlugin,
  FloatingToolbarPlugin,
  UnderlinePlugin,
  StrikePlugin,
} from "../preset/index";

/**
 * 编辑器插件注册表 / Editor plugin registry
 */
export const editorPluginRegistry: EditorPlugin[] = [
  FloatingToolbarPlugin,
  HeadingPlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikePlugin,
  FontColorPlugin,
  FontHighlightPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
  TextAlignPlugin,
  LinkPlugin,
  CodeBlockPlugin,
  ImagePlugin,
  VideoPlugin,
  AttachmentPlugin,
];

/**
 * 创建基础扩展 / Create base extensions
 * @param placeholder 占位符文本 / Placeholder text
 * @returns 基础扩展数组 / Base extensions array
 */
function createBaseExtensions(placeholder?: string): AnyExtension[] {
  return [
    CustomDocument,
    CustomParagraph,
    CustomText,
    Gapcursor,
    PlaceholderPlugin.configure({
      placeholder: placeholder || "",
    }),
  ];
}

/**
 * 合并 editorProps 配置 / Merge editorProps configuration
 * @param propsList editorProps 数组 / EditorProps array
 * @returns 合并后的 editorProps / Merged editorProps
 */
function mergeEditorProps(propsList: EditorProps[]): EditorProps {
  const result: EditorProps = {};

  for (const props of propsList) {
    for (const key in props) {
      const k = key as keyof EditorProps;

      const prev = result[k];
      const next = props[k];

      if (typeof prev === "function" && typeof next === "function") {
        result[k] = function (...args: any[]) {
          const r = (prev as any)(...args);
          if (r === true) return true;
          return (next as any)(...args);
        } as any;
        continue;
      }

      if (next !== undefined) {
        result[k] = next as any;
      }
    }
  }

  return result;
}

/**
 * 创建编辑器插件系统 / Create editor plugin system
 * @param options 创建插件选项 / Plugin creation options
 * @returns 插件系统结果 / Plugin system result
 */
export function createEditorPlugins(
  options: CreateEditorPluginsOptions = {},
): CreateEditorPluginsResult {
  const { include = [], exclude = [], uploader, placeholder } = options;

  const baseExtensions = createBaseExtensions(placeholder);

  let plugins = [...editorPluginRegistry];

  if (include.length) {
    plugins = plugins.filter((p) => include.includes(p.key));
  }

  if (exclude.length) {
    plugins = plugins.filter((p) => !exclude.includes(p.key));
  }

  const extensionMap = new Map<string, AnyExtension>();

  for (const ext of [
    ...baseExtensions,
    ...plugins.flatMap((p) => p.extensions || []),
  ]) {
    extensionMap.set(ext.name, ext);
  }

  const extensions = [...extensionMap.values()];

  const toolbars = plugins.filter((p) => p.toolbar);

  const editorProps = mergeEditorProps(
    plugins.map((p) => p.editorProps).filter(Boolean) as EditorProps[],
  );

  /**
   * 设置编辑器 / Setup editor
   * @param editor 编辑器实例 / Editor instance
   * @param root 根容器元素 / Root container element
   * @returns 清理函数 / Cleanup function
   */
  function setup(editor: Editor, root?: HTMLElement) {
    if (!editor.storage.mediaUploader) {
      editor.storage.mediaUploader = useMediaUploader(editor, uploader);
    }

    (editor.view as any).editor = editor;

    const mediaEngine = root ? new MediaEngine(root) : undefined;

    const cleanups: (() => void)[] = [];

    for (const plugin of plugins) {
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

export { CoreEditor } from "./Editor";
