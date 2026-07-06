import { Editor } from "@cat/free-editor";
import type { UploadResult, UploadContext } from "@cat/free-editor";
import "@cat/free-editor/style.css";
let editor: Editor | null = null;

/**
 * 初始化编辑器
 */
function initEditor() {
  const container = document.getElementById("editor-container");

  if (!container) {
    return;
  }

  editor = new Editor(container, {
    content: "",
    theme: "dark",
    uploader: {
      /* =========================
       * 图片上传
       * ========================= */
      image: {
        // 文件大小
        maxSize: 5 * 1024 * 1024,

        // 文件类型
        accept: ["png"],

        // 格式化响应数据
        format(result: any) {
          console.log("响应数据", result);
          return {
            url: result.data,
          };
        },
        // 自定义上传
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

      /* =========================
       * 视频上传
       * ========================= */

      video: {
        maxSize: 500 * 1024 * 1024,

        accept: ["video/*"],

        onUploadError(error, file) {
          console.error("[video upload error]", error.message, file);

          alert("视频上传失败");
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

      /* =========================
       * 附件上传
       * ========================= */

      file: {
        accept: [".pdf", ".doc", ".docx", ".zip"],

        onUploadError(error, file) {
          console.error("[file upload error]", error.message, file);

          alert("附件上传失败");
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
}

/**
 * 切换主题
 */
function toggleDark() {
  editor?.toggleTheme();
}

/**
 * 获取HTML
 */
function getHtml() {
  const html = editor?.getHtml();

  if (html) {
    const preview = document.getElementById("preview");
    if (preview) {
      preview.textContent = html;
    }
  }
}

/**
 * 初始化事件监听
 */
function initEventListeners() {
  const toggleBtn = document.getElementById("theme-toggle");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleDark);
  }

  const getHtmlBtn = document.getElementById("get-html-btn");

  if (getHtmlBtn) {
    getHtmlBtn.addEventListener("click", getHtml);
  }
}

/**
 * 页面加载完成后初始化
 */
document.addEventListener("DOMContentLoaded", () => {
  initEditor();
  const app = document.getElementById("app");
  if (app) {
    app.classList.toggle("dark");
  }

  initEventListeners();
});

/**
 * 页面卸载时清理
 */
window.addEventListener("beforeunload", () => {
  editor?.destroy();

  editor = null;
});
