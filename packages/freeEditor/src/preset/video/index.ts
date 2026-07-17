import { CustomVideo } from "./extension";

import { createVideoToolbar } from "./toolbar";

import { handleUploadFiles } from "../../core/utils/useMediaUploader";

import type { EditorPlugin, EditorPluginContext } from "../../core";

/**
 * 视频插件 / Video plugin
 *
 * 支持视频插入、拖拽上传、粘贴上传 / Supports video insertion, drag upload, paste upload
 */
export const VideoPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "video",

  /**
   * 扩展实例数组 / Extension instance array
   */
  extensions: [CustomVideo],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createVideoToolbar,

  /**
   * 插件初始化 / Plugin setup
   *
   * @param editor 编辑器实例 / Editor instance
   * @param context 插件上下文 / Plugin context
   * @returns 清理函数 / Cleanup function
   */
  setup(editor, context: EditorPluginContext) {
    const handleVideos = (files: File[]) => {
      handleUploadFiles(editor, files, "video");
    };

    const offDrop = context.mediaEngine?.onDrop("video", (files) => {
      handleVideos(files);
    });

    const offPaste = context.mediaEngine?.onPaste("video", (files) => {
      handleVideos(files);
    });

    return () => {
      offDrop?.();

      offPaste?.();
    };
  },
};
