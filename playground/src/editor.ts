import { Editor, i18n } from "@catmasks/free-editor";
import type { UploadResult, UploadContext } from "@catmasks/free-editor";

import { updateDemoTexts } from "./i18n";

export let editor: Editor | null = null;
/**
 * 初始化编辑器 / Initialize editor
 */
export function initEditor(): void {
  const container = document.getElementById("editor-container");

  if (!container) {
    return;
  }

  editor = new Editor(container, {
    content: "",
    theme: "dark",
    locale: "zh-CN",
    uploader: {
      image: {
        maxSize: 5 * 1024 * 1024,
        accept: ["png"],
        format(result: any) {
          console.log("响应数据", result);
          return {
            url: result.data,
          };
        },
        async upload(file: File, ctx: UploadContext) {
          console.log("[image upload]", file);

          return new Promise<UploadResult>((resolve, reject) => {
            setTimeout(() => {
              if (ctx.signal?.aborted) {
                reject(new Error("Upload canceled"));

                return;
              }
              resolve({
                url: URL.createObjectURL(file),
              });
            }, 3000);
          });
        },
      },

      video: {
        maxSize: 500 * 1024 * 1024,
        accept: ["video/*"],
        onUploadError(error, file) {
          console.error("[video upload error]", error.message, file);
          alert(i18n.t("upload.uploadFailed"));
        },
        onSuccess(result, file) {
          console.log("[video upload success]", result, file);
        },
        async upload(file: File, ctx: UploadContext) {
          console.log("[video upload]", file);

          return new Promise<UploadResult>((resolve, reject) => {
            setTimeout(() => {
              if (ctx.signal?.aborted) {
                reject(new Error("Upload canceled"));

                return;
              }

              resolve({
                url: URL.createObjectURL(file),
              });
            }, 3000);
          });
        },
      },
      attachment: {
        onUploadError(error, file) {
          console.error("[file upload error]", error.message, file);
          alert(i18n.t("upload.uploadFailed"));
        },
        onSuccess(result, file) {
          console.log("[file upload success]", result, file);
        },
        async upload(file: File, ctx: UploadContext) {
          console.log("[file upload]", file);

          return new Promise<UploadResult>((resolve, reject) => {
            setTimeout(() => {
              if (ctx.signal?.aborted) {
                reject(new Error("Upload canceled"));

                return;
              }

              resolve({
                url: URL.createObjectURL(file),
              });
            }, 2000);
          });
        },
      },
    },
  });

  updateDemoTexts("zh-CN");
}

/**
 * 切换主题 / Toggle theme
 */
export function toggleDark(): void {
  editor?.toggleTheme();
}

/**
 * 获取HTML内容 / Get HTML content
 */
export function getHtml(): void {
  const html = editor?.getHtml();

  if (html) {
    const preview = document.getElementById("preview");
    if (preview) {
      preview.textContent = html;
    }
  }
}

/**
 * 销毁编辑器 / Destroy editor
 */
export function destroyEditor(): void {
  editor?.destroy();
  editor = null;
}
