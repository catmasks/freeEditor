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
 * 媒体上传错误码 / Media upload error codes
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
};

/**
 * 解析媒体类型 / Resolve media type
 * @param file 文件对象 / File object
 * @returns 媒体类型 / Media type
 */
const resolveMediaType = (file: File): MediaType => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "file";
};

/**
 * 判断文件是否允许上传 / Check if file is allowed to upload
 * @param file 文件对象 / File object
 * @param type 允许的媒体类型（可选） / Allowed media type (optional)
 * @returns 是否允许 / Whether allowed
 */
const isAllowedFile = (file: File, type?: MediaType): boolean => {
  if (!type) return true;

  const fileType = resolveMediaType(file);

  if (type === "image") return fileType === "image";
  if (type === "video") return fileType === "video";

  return true;
};

/**
 * 处理多文件上传 / Handle multiple file upload
 * @param editor 编辑器实例 / Editor instance
 * @param input 文件输入（单文件/文件数组/FileList） / File input (single file/file array/FileList)
 * @param type 允许的媒体类型（可选） / Allowed media type (optional)
 * @returns 上传任务 Promise / Upload task promise
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
    if (input instanceof File) return [input];
    if (input instanceof FileList) return Array.from(input);
    if (Array.isArray(input)) return input;
    return [];
  })();

  if (!files.length) return;

  const validFiles = files.filter((file) => isAllowedFile(file, type));

  if (!validFiles.length) return;

  if (validFiles.length === 1) {
    const file = validFiles[0];

    return uploader.upload(file, resolveMediaType(file));
  }

  return Promise.all(
    validFiles.map((file) => uploader.upload(file, resolveMediaType(file))),
  );
};

/**
 * 媒体上传错误类 / Media upload error class
 */
class MediaUploadError extends Error {
  /**
   * 错误码 / Error code
   */
  code: string;

  /**
   * 构造函数 / Constructor
   * @param code 错误码 / Error code
   * @param message 错误信息 / Error message
   */
  constructor(code: string, message: string) {
    super(message);
    this.name = "MediaUploadError";
    this.code = code;
  }
}

/**
 * 归一化上传进度 / Normalize upload progress
 * @param progress 进度信息 / Progress information
 * @returns 进度百分比或 null / Progress percentage or null
 */
function normalizeProgress(progress: Partial<UploadProgress>) {
  if (typeof progress.percent === "number") return progress.percent;

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
 * 获取文件名（不含扩展名） / Get file name (without extension)
 * @param file 文件对象 / File object
 * @returns 文件名 / File name
 */
function getFileName(file: File) {
  return file.name.replace(/\.[^/.]+$/, "");
}

/**
 * 默认上传处理函数 / Default upload handler
 * @param file 文件对象 / File object
 * @param context 上传上下文 / Upload context
 * @returns 上传结果 / Upload result
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

  const formData = new FormData();
  formData.append(fieldName || "file", file);

  const extraData = typeof data === "function" ? data() : data;

  if (extraData) {
    Object.entries(extraData).forEach(([k, v]) => {
      formData.append(k, v as any);
    });
  }

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

  const result = await response.json();

  let parsed: UploadResult = result;

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

  const isValidUrl =
    /^data:[^;]+;base64,/.test(url) ||
    url.startsWith("blob:") ||
    (() => {
      try {
        const u = new URL(url);

        return u.protocol === "http:" || u.protocol === "https:";
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

  context.onProgress?.({ percent: 100 } as UploadProgress);

  return {
    url,
    name: parsed?.name || getFileName(file),
  };
}

/**
 * 默认上传配置 / Default upload configuration
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
 * 获取媒体上传配置 / Get media upload configuration
 * @param options 上传选项 / Upload options
 * @param type 媒体类型 / Media type
 * @returns 上传配置 / Upload configuration
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
 * 插入媒体节点 / Insert media node
 * @param editor 编辑器实例 / Editor instance
 * @param options 插入选项 / Insert options
 */
function insertMediaNode(editor: Editor, options: InsertOptions) {
  const nodeType = editor.schema.nodes[options.type];
  if (!nodeType) return;

  const node = nodeType.create({
    id: options.id,
    src: options.src || "",
    name: options.name || "",
    loading: options.loading,
    progress: options.progress,
    error: options.error,
  });

  const { from, to } = editor.state.selection;

  const tr =
    from !== to
      ? editor.state.tr.replaceSelectionWith(node)
      : editor.state.tr.insert(from, node);

  editor.view.dispatch(tr);
}

/**
 * 更新媒体节点 / Update media node
 * @param editor 编辑器实例 / Editor instance
 * @param id 节点 ID / Node ID
 * @param attrs 节点属性 / Node attributes
 */
function updateMediaNode(
  editor: Editor,
  id: string,
  attrs: Record<string, any>,
) {
  editor.state.doc.descendants((node, pos) => {
    if (node.attrs.id !== id) return;

    const tr = editor.state.tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      ...attrs,
    });

    editor.view.dispatch(tr);
    return false;
  });
}

/**
 * 媒体上传器核心函数 / Media uploader core function
 * @param editor 编辑器实例 / Editor instance
 * @param options 上传选项 / Upload options
 * @returns 上传生成器 / Upload generator
 */
export function useMediaUploader(
  editor: Editor,
  options: MediaUploaderOptions = {},
): UploadGenerator {
  const taskMap = new Map<string, UploadTask>();

  /**
   * 上传文件 / Upload file
   * @param file 文件对象 / File object
   * @param type 媒体类型 / Media type
   * @returns 上传任务或 undefined / Upload task or undefined
   */
  const upload = async (file: File, type: MediaType = "image") => {
    if (!editor) return;

    const config = getMediaConfig(options, type);

    if (config.accept?.length) {
      const fileName = file.name.toLowerCase();

      const ok = config.accept.some((item) => {
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

      if (!ok) {
        const err = new MediaUploadError(
          MEDIA_UPLOAD_ERROR_CODE.FILE_TYPE_INVALID,
          `${i18n.t("upload.fileTypeInvalid")}: ${file.type || file.name}`,
        );

        config.onTypeError?.(err, file);

        throw err;
      }
    }

    if (config.maxSize && file.size > config.maxSize) {
      const err = new MediaUploadError(
        MEDIA_UPLOAD_ERROR_CODE.FILE_SIZE_EXCEEDED,
        i18n.t("upload.fileSizeExceeded"),
      );

      config.onSizeError?.(err, file);
      throw err;
    }

    const validateMessage = config.validate?.(file);

    if (typeof validateMessage === "string") {
      const err = new MediaUploadError(
        MEDIA_UPLOAD_ERROR_CODE.FILE_VALIDATE_FAILED,
        validateMessage,
      );

      config.onValidateError?.(err, file);
      throw err;
    }

    const processed = await config.beforeUpload?.(file);
    if (processed === false) return;

    const finalFile = processed || file;

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

          updateMediaNode(editor, nodeId, {
            loading: true,
            error: false,
          });

          fakeTimer = window.setInterval(() => {
            if (aborted || hasRealProgress) return;

            if (fakeProgress >= 90) return;

            fakeProgress += (90 - fakeProgress) * 0.08;

            const p = Math.floor(fakeProgress);

            task.progress = p;

            updateMediaNode(editor, nodeId, { progress: p });
          }, 200);

          try {
            const result = await config.upload!(finalFile, {
              signal: controller.signal,
              config,

              onProgress(progress) {
                if (aborted) return;

                const p = normalizeProgress(progress);
                if (p === null) return;

                hasRealProgress = true;
                if (fakeTimer) clearInterval(fakeTimer);

                task.progress = p;

                updateMediaNode(editor, nodeId, { progress: p });

                config.onProgress?.({ ...progress, percent: p }, finalFile);
              },
            });

            if (aborted) return;

            if (fakeTimer) clearInterval(fakeTimer);

            task.status = "success";
            task.progress = 100;
            task.response = result;

            updateMediaNode(editor, nodeId, {
              src: result.url,
              name: result.name || getFileName(finalFile),
              loading: false,
              progress: 100,
              error: false,
            });

            config.onSuccess?.(result, finalFile);
          } catch (e: any) {
            console.error(e);
            if (aborted) return;

            if (fakeTimer) clearInterval(fakeTimer);

            if (e?.name === "AbortError") {
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

            task.status = "error";
            task.error = e;

            updateMediaNode(editor, nodeId, {
              loading: false,
              error: true,
            });

            config.onUploadError?.(e, finalFile);
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
        if (fakeTimer) clearInterval(fakeTimer);

        aborted = true;
        controller.abort();

        task.status = "canceled";

        updateMediaNode(editor, nodeId, {
          loading: false,
          error: true,
        });

        taskMap.delete(nodeId);
      },
    };

    taskMap.set(nodeId, task);

    insertMediaNode(editor, {
      id: nodeId,
      type,
      name: getFileName(finalFile),
      loading: true,
      progress: 0,
      error: false,
    });

    task.start();

    return task;
  };

  return {
    upload,
    retry(taskId: string) {
      taskMap.get(taskId)?.retry();
    },
    cancel(taskId: string) {
      taskMap.get(taskId)?.cancel();
    },
    getTask(id: string) {
      return taskMap.get(id);
    },
  };
}
