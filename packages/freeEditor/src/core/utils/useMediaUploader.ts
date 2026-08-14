import type { Editor } from "@tiptap/core";

import type {
  MediaType,
  MediaUploaderConfig,
  UploadResult,
  UploadContext,
  InsertOptions,
  MediaUploaderOptions,
  UploadProgress,
  UploadTask,
  UploadGenerator,
} from "../types";

import { i18n } from "../i18n";

/**
 * 媒体上传错误码。
 * Media upload error codes.
 */
const MEDIA_UPLOAD_ERROR_CODE = {
  MISSING_ACTION: "MISSING_ACTION",
  REQUEST_FAILED: "REQUEST_FAILED",
  INVALID_RESPONSE_URL: "INVALID_RESPONSE_URL",
  INVALID_URL_FORMAT: "INVALID_URL_FORMAT",
  FILE_TYPE_INVALID: "FILE_TYPE_INVALID",
  FILE_SIZE_EXCEEDED: "FILE_SIZE_EXCEEDED",
  FILE_VALIDATE_FAILED: "FILE_VALIDATE_FAILED",
  UPLOAD_ABORTED: "UPLOAD_ABORTED",
} as const;

/**
 * 媒体上传错误类。
 * Media upload error class.
 */
class MediaUploadError extends Error {
  /**
   * 错误码。
   * Error code.
   */
  code: string;

  /**
   * 构造函数。
   * Constructor.
   *
   * @param code 错误码 / Error code.
   * @param message 错误信息 / Error message.
   */
  constructor(code: string, message: string) {
    super(message);

    this.name = "MediaUploadError";

    this.code = code;
  }
}

/**
 * 解析媒体类型。
 * Resolve media type.
 *
 * @param file 文件对象 / The file object.
 */
const resolveMediaType = (file: File): MediaType => {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  return "attachment";
};

/**
 * 判断文件是否允许上传。
 * Determine if the file is allowed to upload.
 *
 * @param file 文件对象 / The file object.
 * @param type 媒体类型（可选） / Media type (optional).
 */
const isAllowedFile = (file: File, type?: MediaType): boolean => {
  if (!type) {
    return true;
  }

  const fileType = resolveMediaType(file);

  if (type === "image") {
    return fileType === "image";
  }

  if (type === "video") {
    return fileType === "video";
  }

  return true;
};

/**
 * 处理多文件上传。
 * Handle multi-file upload.
 *
 * @param editor 编辑器实例 / Editor instance.
 * @param input 文件或文件列表 / File or file list.
 * @param type 媒体类型（可选） / Media type (optional).
 */
export const handleUploadFiles = async (
  editor: Editor,
  input: File | File[] | FileList,
  type?: MediaType,
) => {
  const uploader = editor.storage.mediaUploader;

  if (!uploader || typeof uploader.upload !== "function") {
    throw new MediaUploadError(
      MEDIA_UPLOAD_ERROR_CODE.MISSING_ACTION,
      i18n.t("upload.missingAction"),
    );
  }

  const files: File[] = (() => {
    if (input instanceof File) {
      return [input];
    }

    if (input instanceof FileList) {
      return Array.from(input);
    }

    if (Array.isArray(input)) {
      return input;
    }

    return [];
  })();

  if (!files.length) {
    return;
  }

  const validFiles = files.filter((file) => isAllowedFile(file, type));

  if (!validFiles.length) {
    return;
  }

  const getUploadType = (file: File): MediaType => {
    return type || resolveMediaType(file);
  };

  if (validFiles.length === 1) {
    const file = validFiles[0];

    return uploader.upload(file, getUploadType(file));
  }

  return Promise.all(
    validFiles.map((file) => uploader.upload(file, getUploadType(file))),
  );
};

/**
 * 归一化上传进度。
 * Normalize upload progress.
 *
 * @param progress 进度对象 / Progress object.
 */
function normalizeProgress(progress: Partial<UploadProgress>): number | null {
  if (typeof progress.percent === "number") {
    return progress.percent;
  }

  if (
    typeof progress.loaded === "number" &&
    typeof progress.total === "number" &&
    progress.total > 0
  ) {
    return Math.floor((progress.loaded / progress.total) * 100);
  }

  return null;
}

/**
 * 获取文件名，不包含扩展名。
 * Get file name without extension.
 *
 * @param file 文件对象 / The file object.
 */
function getFileName(file: File): string {
  return file.name.replace(/\.[^/.]+$/, "");
}

/**
 * 获取完整文件名（包含扩展名）。
 * Get full file name (including extension).
 *
 * @param file 文件对象 / The file object.
 */
function getFullFileName(file: File): string {
  return file.name;
}

/**
 * 默认上传处理函数。
 * Default upload handler function.
 *
 * @param file 文件对象 / The file object.
 * @param context 上传上下文 / Upload context.
 */
async function defaultUploadHandler(
  file: File,
  context: UploadContext,
): Promise<UploadResult> {
  const {
    action,
    method = "POST",
    headers,
    withCredentials,
    fieldName,
    format,
    data,
  } = context.config;

  if (!action) {
    throw new MediaUploadError(
      MEDIA_UPLOAD_ERROR_CODE.MISSING_ACTION,
      i18n.t("upload.missingAction"),
    );
  }

  /**
   * 创建 FormData。
   * Create FormData.
   */
  const formData = new FormData();

  formData.append(fieldName || "file", file);

  /**
   * 额外数据。
   * Extra data.
   */
  const extraData = typeof data === "function" ? data() : data;

  if (extraData) {
    Object.entries(extraData).forEach(([key, value]) => {
      formData.append(key, value as any);
    });
  }

  /**
   * 发起请求。
   * Send request.
   */
  const response = await fetch(action, {
    method,
    headers,
    body: formData,
    signal: context.signal,
    credentials: withCredentials ? "include" : "same-origin",
  });

  if (!response.ok) {
    throw new MediaUploadError(
      MEDIA_UPLOAD_ERROR_CODE.REQUEST_FAILED,
      `${i18n.t("upload.requestFailed")}: ${response.status}`,
    );
  }

  /**
   * 读取服务端响应。
   * Read server response.
   */
  const result = await response.json();

  let parsed: UploadResult = result;

  /**
   * 自定义响应格式化。
   * Custom response formatting.
   */
  if (typeof format === "function") {
    parsed = await format(result);
  }

  const url = parsed?.url;

  if (!url || typeof url !== "string") {
    throw new MediaUploadError(
      MEDIA_UPLOAD_ERROR_CODE.INVALID_RESPONSE_URL,
      i18n.t("upload.invalidResponseUrl"),
    );
  }

  /**
   * URL 格式校验。
   * Validate URL format.
   */
  const isValidUrl =
    /^data:[^;]+;base64,/.test(url) ||
    url.startsWith("blob:") ||
    (() => {
      try {
        const parsedUrl = new URL(url);

        return (
          parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
        );
      } catch {
        return false;
      }
    })();

  if (!isValidUrl) {
    throw new MediaUploadError(
      MEDIA_UPLOAD_ERROR_CODE.INVALID_URL_FORMAT,
      i18n.t("upload.invalidUrlFormat"),
    );
  }

  /**
   * 上传完成。
   * Upload complete.
   */
  context.onProgress?.({
    percent: 100,
  } as UploadProgress);

  return {
    url,
    name: parsed?.name || getFileName(file),
  };
}

/**
 * 默认上传配置。
 * Default upload configuration.
 */
const defaultConfig: MediaUploaderConfig = {
  method: "POST",
  fieldName: "file",
  withCredentials: false,
  upload: defaultUploadHandler,
  maxSize: Infinity,
  accept: [],

  beforeUpload(file) {
    return file;
  },
};

/**
 * 获取媒体上传配置。
 * Get media upload configuration.
 *
 * @param options 媒体上传器选项 / Media uploader options.
 * @param type 媒体类型 / Media type.
 */
function getMediaConfig(
  options: MediaUploaderOptions,
  type: MediaType,
): MediaUploaderConfig {
  return {
    ...defaultConfig,
    ...(options[type] || {}),
  };
}

/**
 * 插入媒体节点。
 * Insert media node.
 *
 * @param editor 编辑器实例 / Editor instance.
 * @param options 插入选项 / Insert options.
 */
function insertMediaNode(editor: Editor, options: InsertOptions) {
  const nodeType = editor.schema.nodes[options.type];

  if (!nodeType) {
    return;
  }

  const node = nodeType.create({
    id: options.id,
    src: options.src || "",
    name: options.name || "",
    loading: options.loading,
    progress: options.progress,
    error: options.error,
    size: options.size,
  });

  const { from, to } = editor.state.selection;

  const tr =
    from !== to
      ? editor.state.tr.replaceSelectionWith(node)
      : editor.state.tr.insert(from, node);

  editor.view.dispatch(tr);
}

/**
 * 更新媒体节点。
 * Update media node.
 *
 * @param editor 编辑器实例 / Editor instance.
 * @param id 节点 ID / Node ID.
 * @param attrs 要更新的属性 / Attributes to update.
 */
function updateMediaNode(
  editor: Editor,
  id: string,
  attrs: Record<string, any>,
) {
  editor.state.doc.descendants((node, pos) => {
    if (node.attrs.id !== id) {
      return;
    }

    const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      ...attrs,
    });

    editor.view.dispatch(tr);

    return false;
  });
}

/**
 * 将附件节点替换成链接文本。
 * Replace attachment node with link text.
 *
 * @param editor 编辑器实例 / Editor instance.
 * @param id 节点 ID / Node ID.
 * @param url 链接地址 / URL.
 * @param text 链接文本 / Link text.
 */
function replaceMediaNodeWithLink(
  editor: Editor,
  id: string,
  url: string,
  text: string,
) {
  editor.state.doc.descendants((node, pos) => {
    if (node.attrs.id !== id) {
      return;
    }

    const linkType = editor.schema.marks.link;

    if (!linkType) {
      return;
    }

    const linkMark = linkType.create({
      href: url,
      target: "_blank",
      rel: "noopener noreferrer nofollow",
    });

    const textNode = editor.schema.text(text, [linkMark]);

    const tr = editor.state.tr.replaceWith(pos, pos + node.nodeSize, textNode);

    editor.view.dispatch(tr);

    return false;
  });
}

/**
 * 删除媒体节点。
 * Remove media node.
 *
 * @param editor 编辑器实例 / Editor instance.
 * @param id 节点 ID / Node ID.
 */
function removeMediaNode(editor: Editor, id: string) {
  editor.state.doc.descendants((node, pos) => {
    if (node.attrs.id !== id) {
      return;
    }

    const tr = editor.state.tr.delete(pos, pos + node.nodeSize);

    editor.view.dispatch(tr);

    return false;
  });
}

/**
 * 插入通用上传占位节点。
 * Insert generic upload placeholder node.
 *
 * @param editor 编辑器实例 / Editor instance.
 * @param options 选项 / Options.
 * @returns 是否插入成功 / Whether insertion succeeded.
 */
function insertUploadPlaceholder(
  editor: Editor,
  options: {
    id: string;
    name: string;
    type: MediaType;
    progress: number;
    loading: boolean;
  },
): boolean {
  const nodeType = editor.schema.nodes.uploadPlaceholder;

  if (!nodeType) {
    console.error("[MediaUploader] uploadPlaceholder 节点未注册。");
    console.error("[MediaUploader] uploadPlaceholder node not registered.");

    return false;
  }

  const node = nodeType.create({
    id: options.id,
    name: options.name,
    type: options.type,
    progress: options.progress,
    loading: options.loading,
  });

  const { from, to } = editor.state.selection;

  const tr =
    from !== to
      ? editor.state.tr.replaceSelectionWith(node)
      : editor.state.tr.insert(from, node);

  editor.view.dispatch(tr);

  return true;
}

/**
 * 更新通用上传占位节点。
 * Update generic upload placeholder node.
 *
 * @param editor 编辑器实例 / Editor instance.
 * @param id 节点 ID / Node ID.
 * @param attrs 要更新的属性 / Attributes to update.
 */
function updateUploadPlaceholder(
  editor: Editor,
  id: string,
  attrs: Record<string, any>,
): void {
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== "uploadPlaceholder") {
      return;
    }

    if (node.attrs.id !== id) {
      return;
    }

    const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      ...attrs,
    });

    editor.view.dispatch(tr);

    return false;
  });
}

/**
 * 删除通用上传占位节点。
 * Remove generic upload placeholder node.
 *
 * @param editor 编辑器实例 / Editor instance.
 * @param id 节点 ID / Node ID.
 */
function removeUploadPlaceholder(editor: Editor, id: string): void {
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== "uploadPlaceholder") {
      return;
    }

    if (node.attrs.id !== id) {
      return;
    }

    const tr = editor.state.tr.delete(pos, pos + node.nodeSize);

    editor.view.dispatch(tr);

    return false;
  });
}

/**
 * 上传前统一校验和处理。
 * Pre-upload validation and processing.
 *
 * @param file 文件对象 / The file object.
 * @param type 媒体类型 / Media type.
 * @param config 上传配置 / Upload configuration.
 * @returns 处理后的文件 / Processed file.
 */
async function prepareUploadFile(
  file: File,
  type: MediaType,
  config: MediaUploaderConfig,
): Promise<File> {
  /**
   * 文件类型校验。
   * File type validation.
   */
  if (config.accept?.length) {
    const fileName = file.name.toLowerCase();

    const allowed = config.accept.some((item) => {
      const acceptItem = item.toLowerCase().trim();

      if (acceptItem.endsWith("/*")) {
        const prefix = acceptItem.replace("/*", "/");

        return file.type.startsWith(prefix);
      }

      if (acceptItem.includes("/")) {
        return file.type === acceptItem;
      }

      const ext = acceptItem.startsWith(".") ? acceptItem : `.${acceptItem}`;

      return fileName.endsWith(ext);
    });

    if (!allowed) {
      const error = new MediaUploadError(
        MEDIA_UPLOAD_ERROR_CODE.FILE_TYPE_INVALID,
        `${i18n.t("upload.fileTypeInvalid")}: ${file.type || file.name}`,
      );

      config.onTypeError?.(error, file);

      throw error;
    }
  }

  /**
   * 文件大小校验。
   * File size validation.
   */
  if (config.maxSize && file.size > config.maxSize) {
    const error = new MediaUploadError(
      MEDIA_UPLOAD_ERROR_CODE.FILE_SIZE_EXCEEDED,
      i18n.t("upload.fileSizeExceeded"),
    );

    config.onSizeError?.(error, file);

    throw error;
  }

  /**
   * 自定义校验。
   * Custom validation.
   */
  const validateMessage = config.validate?.(file);

  if (typeof validateMessage === "string") {
    const error = new MediaUploadError(
      MEDIA_UPLOAD_ERROR_CODE.FILE_VALIDATE_FAILED,
      validateMessage,
    );

    config.onValidateError?.(error, file);

    throw error;
  }

  /**
   * 上传前处理。
   * Pre-upload processing.
   */
  const processed = await config.beforeUpload?.(file);

  if (processed === false) {
    throw new MediaUploadError(
      MEDIA_UPLOAD_ERROR_CODE.FILE_VALIDATE_FAILED,
      i18n.t("upload.uploadCanceled"),
    );
  }

  return processed || file;
}

/**
 * 创建媒体上传器。
 * Create media uploader.
 *
 * @param editor 编辑器实例 / Editor instance.
 * @param options 媒体上传器选项 / Media uploader options.
 * @returns 上传生成器 / Upload generator.
 */
export function useMediaUploader(
  editor: Editor,
  options: MediaUploaderOptions = {},
): UploadGenerator {
  /**
   * 普通媒体上传任务。
   * Normal media upload tasks.
   */
  const taskMap = new Map<string, UploadTask>();

  /**
   * 纯上传任务的 AbortController。
   * AbortController for pure upload tasks.
   */
  const uploadFileControllers = new Map<string, AbortController>();

  /**
   * 纯上传
   * Pure upload
   */
  const uploadFile = async (
    file: File,
    type: MediaType = "image",
  ): Promise<UploadResult> => {
    if (!editor) {
      throw new MediaUploadError(
        MEDIA_UPLOAD_ERROR_CODE.REQUEST_FAILED,
        i18n.t("upload.missingAction"),
      );
    }

    const config = getMediaConfig(options, type);

    /**
     * 上传前校验。
     * Pre-upload validation.
     */
    const finalFile = await prepareUploadFile(file, type, config);

    /**
     * 生成纯上传任务 ID。
     * Generate pure upload task ID.
     */
    const taskId = crypto.randomUUID();

    /**
     * 创建 AbortController。
     * Create AbortController.
     */
    const controller = new AbortController();

    /**
     * 保存 controller，
     * Save controller,
     * 供 UploadGenerator.cancel() 使用。
     * for use by UploadGenerator.cancel().
     */
    uploadFileControllers.set(taskId, controller);

    /**
     * 插入上传占位。
     * Insert upload placeholder.
     */
    const inserted = insertUploadPlaceholder(editor, {
      id: taskId,
      name: finalFile.name,
      type,
      progress: 0,
      loading: true,
    });

    if (!inserted) {
      uploadFileControllers.delete(taskId);

      throw new MediaUploadError(
        MEDIA_UPLOAD_ERROR_CODE.REQUEST_FAILED,
        "uploadPlaceholder 节点未注册",
      );
    }

    let fakeTimer: number | undefined;

    let fakeProgress = 0;

    let hasRealProgress = false;

    fakeTimer = window.setInterval(() => {
      if (hasRealProgress || controller.signal.aborted) {
        return;
      }

      if (fakeProgress >= 90) {
        return;
      }

      fakeProgress += (90 - fakeProgress) * 0.08;

      updateUploadPlaceholder(editor, taskId, {
        progress: Math.floor(fakeProgress),
      });
    }, 200);

    try {
      /**
       * 执行纯上传。
       * Execute pure upload.
       */
      const result = await config.upload!(finalFile, {
        signal: controller.signal,

        config,

        onProgress(progress) {
          const percent = normalizeProgress(progress);

          if (percent === null) {
            return;
          }

          hasRealProgress = true;

          if (fakeTimer) {
            clearInterval(fakeTimer);

            fakeTimer = undefined;
          }

          /**
           * 更新上传占位进度。
           * Update upload placeholder progress.
           */
          updateUploadPlaceholder(editor, taskId, {
            progress: percent,
          });

          /**
           * 保留外部上传进度回调。
           * Keep external upload progress callback.
           */
          config.onProgress?.(
            {
              ...progress,
              percent,
            },
            finalFile,
          );
        },
      });

      if (fakeTimer) {
        clearInterval(fakeTimer);

        fakeTimer = undefined;
      }

      updateUploadPlaceholder(editor, taskId, {
        progress: 100,
      });

      /**
       * 上传成功。
       * Upload success.
       */
      config.onSuccess?.(result, finalFile);

      return result;
    } catch (error: any) {
      /**
       * 取消。
       * Cancellation.
       */
      if (error?.name === "AbortError") {
        const uploadError = new MediaUploadError(
          MEDIA_UPLOAD_ERROR_CODE.UPLOAD_ABORTED,
          i18n.t("upload.uploadAborted"),
        );

        config.onUploadError?.(uploadError, finalFile);

        throw uploadError;
      }

      /**
       * 普通上传失败。
       * Normal upload failure.
       */
      config.onUploadError?.(error, finalFile);

      throw error;
    } finally {
      uploadFileControllers.delete(taskId);

      if (fakeTimer) {
        clearInterval(fakeTimer);

        fakeTimer = undefined;
      }

      /**
       * 最终删除上传占位。
       * Finally remove upload placeholder.
       */
      removeUploadPlaceholder(editor, taskId);
    }
  };

  /**
   * 普通编辑器上传
   * Normal editor upload
   */
  const upload = async (file: File, type: MediaType = "image") => {
    if (!editor) {
      return;
    }

    const config = getMediaConfig(options, type);

    /**
     * 上传前统一校验。
     * Pre-upload validation.
     */
    const finalFile = await prepareUploadFile(file, type, config);

    /**
     * 创建任务 ID。
     * Create task ID.
     */
    const nodeId = crypto.randomUUID();

    let controller = new AbortController();

    let fakeTimer: number | undefined;

    let fakeProgress = 0;

    let hasRealProgress = false;

    let aborted = false;

    const task: UploadTask = {
      id: nodeId,

      file: finalFile,

      type,

      progress: 0,

      status: "idle",

      async start() {
        aborted = false;

        controller = new AbortController();

        fakeProgress = 0;

        hasRealProgress = false;

        const run = async () => {
          task.status = "uploading";

          /**
           * 更新媒体节点。
           * Update media node.
           */
          updateMediaNode(editor, nodeId, {
            loading: true,
            error: false,
          });

          /**
           * 模拟进度。
           * Simulate progress.
           */
          fakeTimer = window.setInterval(() => {
            if (aborted || hasRealProgress) {
              return;
            }

            if (fakeProgress >= 90) {
              return;
            }

            fakeProgress += (90 - fakeProgress) * 0.08;

            const progress = Math.floor(fakeProgress);

            task.progress = progress;

            updateMediaNode(editor, nodeId, {
              progress,
            });
          }, 200);

          try {
            /**
             * 真正上传。
             * Actual upload.
             */
            const result = await config.upload!(finalFile, {
              signal: controller.signal,

              config,

              onProgress(progress) {
                if (aborted) {
                  return;
                }

                const value = normalizeProgress(progress);

                if (value === null) {
                  return;
                }

                hasRealProgress = true;

                if (fakeTimer) {
                  clearInterval(fakeTimer);

                  fakeTimer = undefined;
                }

                task.progress = value;

                updateMediaNode(editor, nodeId, {
                  progress: value,
                });

                config.onProgress?.(
                  {
                    ...progress,
                    percent: value,
                  },
                  finalFile,
                );
              },
            });

            if (aborted) {
              return;
            }

            if (fakeTimer) {
              clearInterval(fakeTimer);

              fakeTimer = undefined;
            }

            /**
             * 上传成功。
             * Upload success.
             */
            task.status = "success";

            task.progress = 100;

            task.response = result;

            const displayName =
              result.name ||
              (type === "attachment"
                ? getFullFileName(finalFile)
                : getFileName(finalFile));

            /**
             * 附件：
             * Attachment:
             * 替换为链接文本。
             * Replace with link text.
             */
            if (type === "attachment") {
              replaceMediaNodeWithLink(editor, nodeId, result.url, displayName);
            } else {
              /**
               * 图片 / 视频：
               * Image / Video:
               * 更新节点。
               * Update node.
               */
              updateMediaNode(editor, nodeId, {
                src: result.url,
                name: displayName,
                loading: false,
                progress: 100,
                error: false,
              });
            }

            taskMap.delete(nodeId);

            config.onSuccess?.(result, finalFile);
          } catch (error: any) {
            console.error(error);

            if (aborted) {
              return;
            }

            if (fakeTimer) {
              clearInterval(fakeTimer);

              fakeTimer = undefined;
            }

            /**
             * 上传取消。
             * Upload canceled.
             */
            if (error?.name === "AbortError") {
              task.status = "canceled";

              task.error = new MediaUploadError(
                MEDIA_UPLOAD_ERROR_CODE.UPLOAD_ABORTED,
                i18n.t("upload.uploadAborted"),
              );

              updateMediaNode(editor, nodeId, {
                loading: false,
                error: true,
              });

              config.onUploadError?.(task.error, finalFile);

              return;
            }

            /**
             * 普通上传失败。
             * Normal upload failure.
             */
            task.status = "error";

            task.error = error;

            updateMediaNode(editor, nodeId, {
              loading: false,
              error: true,
            });

            config.onUploadError?.(error, finalFile);
          }
        };

        await run();
      },

      async retry() {
        aborted = true;

        controller.abort();

        updateMediaNode(editor, nodeId, {
          loading: true,
          error: false,
          progress: 0,
        });

        aborted = false;

        controller = new AbortController();

        fakeProgress = 0;

        hasRealProgress = false;

        task.error = undefined;

        await this.start();
      },

      cancel() {
        if (fakeTimer) {
          clearInterval(fakeTimer);

          fakeTimer = undefined;
        }

        aborted = true;

        controller.abort();

        task.status = "canceled";

        if (type === "attachment") {
          removeMediaNode(editor, nodeId);
        } else {
          updateMediaNode(editor, nodeId, {
            loading: false,
            error: true,
          });
        }

        taskMap.delete(nodeId);
      },
    };

    /**
     * 保存普通媒体任务。
     * Save normal media task.
     */
    taskMap.set(nodeId, task);

    /**
     * 插入临时媒体节点。
     * Insert temporary media node.
     */
    insertMediaNode(editor, {
      id: nodeId,
      type,
      name:
        type === "attachment"
          ? getFullFileName(finalFile)
          : getFileName(finalFile),
      size: finalFile.size,
      loading: true,
      progress: 0,
      error: false,
    });

    /**
     * 启动上传。
     * Start upload.
     */
    void task.start();

    return task;
  };

  return {
    /**
     * 普通媒体上传。
     * Normal media upload.
     */
    upload,

    /**
     * 纯上传。
     * Pure upload.
     */
    uploadFile,

    /**
     * 重试普通媒体上传。
     * Retry normal media upload.
     */
    retry(taskId: string) {
      taskMap.get(taskId)?.retry();
    },

    /**
     * 取消上传
     * Cancel upload.
     *
     * @param taskId 任务 ID / Task ID.
     */
    cancel(taskId: string) {
      /**
       * 优先处理普通媒体任务。
       * Prioritize normal media tasks.
       */
      const task = taskMap.get(taskId);

      if (task) {
        task.cancel();

        return;
      }

      /**
       * 处理纯上传任务。
       * Handle pure upload task.
       */
      const controller = uploadFileControllers.get(taskId);

      if (controller) {
        controller.abort();
      }
    },

    /**
     * 获取普通媒体上传任务。
     * Get normal media upload task.
     * @param id 任务 ID / Task ID.
     */
    getTask(id: string) {
      return taskMap.get(id);
    },
  };
}
