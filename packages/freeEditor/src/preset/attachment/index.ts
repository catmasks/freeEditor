import { CustomAttachment } from "./extension";

import { createAttachmentToolbar } from "./toolbar";

import { handleUploadFiles } from "../../core/utils/useMediaUploader";

import type { EditorPlugin, EditorPluginContext } from "../../core";

/**
 * 附件插件 / Attachment plugin
 *
 * 支持附件插入、拖拽上传、粘贴上传 / Supports attachment insertion, drag upload, paste upload
 */
export const AttachmentPlugin: EditorPlugin = {
  /**
   * 插件唯一标识 / Plugin unique key
   */
  key: "attachment",

  /**
   * 扩展实例数组 / Extension instance array
   */
  extensions: [CustomAttachment],

  /**
   * 工具栏创建函数 / Toolbar creation function
   */
  toolbar: createAttachmentToolbar,

  /**
   * 插件初始化 / Plugin setup
   *
   * @param editor 编辑器实例 / Editor instance
   * @param context 插件上下文 / Plugin context
   * @returns 清理函数 / Cleanup function
   */
  setup(editor, context: EditorPluginContext) {
    const handleAttachments = (files: File[]) => {
      handleUploadFiles(editor, files, "attachment");
    };

    const offDrop = context.mediaEngine?.onDrop("attachment", (files) => {
      handleAttachments(files);
    });

    const offPaste = context.mediaEngine?.onPaste("attachment", (files) => {
      handleAttachments(files);
    });

    return () => {
      offDrop?.();

      offPaste?.();
    };
  },
};
