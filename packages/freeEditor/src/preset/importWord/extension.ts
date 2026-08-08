/**
 * ImportWord Tiptap Extension
 */

import { Extension } from "@tiptap/core";
import type { Editor, CommandProps } from "@tiptap/core";

import type { UploadGenerator, UploadTask } from "../../core/types";

import mammoth from "mammoth";

/**
 * 转换为语义化标签方便 Tiptap 解析。
 */
function transformMammothHtml(html: string): string {
  const parser = new DOMParser();

  const doc = parser.parseFromString(html, "text/html");

  const body = doc.body;

  const spans = body.querySelectorAll("span");

  spans.forEach((span) => {
    const style = span.getAttribute("style") || "";

    const decoration = style.match(/text-decoration(?:-line)?\s*:\s*([^;]+)/i);

    if (!decoration) {
      return;
    }

    const value = decoration[1].trim().toLowerCase();

    const parent = span.parentNode;

    if (!parent) {
      return;
    }

    if (value.includes("underline")) {
      const u = doc.createElement("u");

      u.innerHTML = span.innerHTML;

      parent.replaceChild(u, span);

      return;
    }

    if (value.includes("line-through")) {
      const del = doc.createElement("del");

      del.innerHTML = span.innerHTML;

      parent.replaceChild(del, span);
    }
  });

  return body.innerHTML;
}

/**
 * 精确转换 ArrayBuffer
 *
 */
function normalizeArrayBuffer(
  buffer: ArrayBuffer | ArrayBufferView,
): ArrayBuffer {
  if (buffer instanceof ArrayBuffer) {
    return buffer;
  }

  const view = new Uint8Array(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength,
  );

  /**
   * slice 创建新的 ArrayBuffer
   */
  return view.slice().buffer;
}

/**
 * 创建图片文件
 */
function createImageFile(buffer: ArrayBuffer, mime: string): File {
  const ext = mime.split("/")[1] || "png";

  const blob = new Blob([buffer], {
    type: mime,
  });

  return new File([blob], `word-image.${ext}`, {
    type: mime,
  });
}

/**
 * 等待上传任务完成
 */
function waitUploadTask(task: UploadTask): Promise<string | null> {
  return new Promise((resolve) => {
    const start = Date.now();

    const timer = window.setInterval(() => {
      if (task.response?.url) {
        clearInterval(timer);

        resolve(task.response.url);

        return;
      }

      if (task.status === "error" || task.status === "canceled") {
        clearInterval(timer);

        resolve(null);

        return;
      }

      if (Date.now() - start > 30000) {
        clearInterval(timer);

        resolve(null);
      }
    }, 100);
  });
}

/**
 * 上传 Word 图片
 */
async function uploadImage(
  uploader: UploadGenerator,
  buffer: ArrayBuffer,
  mime: string,
): Promise<string | null> {
  try {
    const file = createImageFile(buffer, mime);

    const task = await uploader.upload(file, "image");

    if (!task) {
      return null;
    }

    return await waitUploadTask(task);
  } catch {
    return null;
  }
}

/**
 * 导入 Word 文档并插入编辑器
 *
 * @param file Word 文件
 * @param editor 编辑器实例
 */
async function importDocxToEditor(
  file: File,
  editor: Editor,
): Promise<boolean> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    const uploader = editor.storage.mediaUploader as
      | UploadGenerator
      | undefined;

    const result = await mammoth.convertToHtml(
      {
        arrayBuffer,
      },
      {
        styleMap: ["u => u"],

        convertImage: mammoth.images.imgElement(async (image) => {
          try {
            const imageBuffer = await image.read();

            const buffer = normalizeArrayBuffer(imageBuffer);

            const mime = image.contentType || "image/png";

            /**
             * 优先上传服务器
             */
            if (uploader && typeof uploader.upload === "function") {
              const url = await uploadImage(uploader, buffer, mime);

              if (url) {
                return {
                  src: url,
                };
              }
            }

            /**
             * 上传失败不保存 base64
             */
            return {
              src: "",
            };
          } catch {
            return {
              src: "",
            };
          }
        }),
      },
    );

    if (!result.value) {
      return false;
    }

    const html = transformMammothHtml(result.value);

    editor.commands.insertContent(html);

    return true;
  } catch (error) {
    console.error("[ImportWord] 导入 Word 文档失败:", error);

    return false;
  }
}

/**
 * ImportWord 扩展
 */
export const ImportWord = Extension.create({
  name: "importWord",

  addCommands() {
    return {
      /**
       * 导入 Word 文档
       */
      importWord:
        (file: File) =>
        ({ editor }: CommandProps) => {
          if (!file) {
            return false;
          }

          importDocxToEditor(file, editor).catch((err) => {
            console.error("[ImportWord] 导入失败:", err);
          });

          return true;
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    importWord: {
      /**
       * 导入 Word 文档内容
       *
       * @param file docx 文件
       */
      importWord: (file: File) => ReturnType;
    };
  }
}
