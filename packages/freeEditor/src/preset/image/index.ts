import { CustomImage } from "./extension";

import { createImageToolbar } from "./toolbar";

import { handleUploadFiles } from "../../core/utils/useMediaUploader";

import type { EditorPlugin, EditorPluginContext } from "../../core";

/**
 * 图片插件 / Image plugin
 *
 * 支持图片插入、拖拽上传、粘贴上传 / Supports image insertion, drag upload, paste upload
 */
export const ImagePlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "image",

  /**
   * 扩展实例数组 / Extension instance array
   */
  extensions: [CustomImage],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createImageToolbar,

  /**
   * 插件初始化 / Plugin setup
   *
   * @param editor 编辑器实例 / Editor instance
   * @param context 插件上下文 / Plugin context
   * @returns 清理函数 / Cleanup function
   */
  setup(editor, context: EditorPluginContext) {
    const handleImages = (files: File[]) => {
      handleUploadFiles(editor, files, "image");
    };

    const offDrop = context.mediaEngine?.onDrop((files) => {
      handleImages(files);
    });

    const offPaste = context.mediaEngine?.onPaste((files) => {
      handleImages(files);
    });

    return () => {
      offDrop?.();

      offPaste?.();
    };
  },
};
