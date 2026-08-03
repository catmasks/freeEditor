import { Editor, i18n } from "@catmasks/free-editor";
import type { UploadResult, UploadContext } from "@catmasks/free-editor";

import { updateDemoTexts } from "./i18n";

export let editor: Editor | null = null;

/**
 * 更新状态栏文字 / Update status label text
 */
export function updateEditorStateLabel(): void {
  const label = document.getElementById("editor-state-label");
  const toggleDisabledBtn = document.getElementById(
    "toggle-disabled",
  ) as HTMLButtonElement | null;
  const toggleReadonlyBtn = document.getElementById(
    "toggle-readonly",
  ) as HTMLButtonElement | null;

  if (!editor || !label) return;

  const disabled = editor.disabled;
  const readonly = editor.readonly;

  /** 同步按钮高亮状态 */
  if (toggleDisabledBtn) {
    toggleDisabledBtn.classList.toggle("active", disabled);
  }
  if (toggleReadonlyBtn) {
    toggleReadonlyBtn.classList.toggle("active", readonly);
  }

  if (readonly) {
    label.textContent = "只读模式（不可编辑 / 工具栏已隐藏）";
  } else if (disabled) {
    label.textContent = "禁用模式（不可编辑 / 工具栏仍可见）";
  } else {
    label.textContent = "编辑模式（可编辑 / 工具栏显示）";
  }
}

/**
 * 切换禁用状态 / Toggle disabled state
 */
export function toggleDisabled(): void {
  if (!editor) return;
  editor.setDisabled(!editor.disabled);
  updateEditorStateLabel();
  console.log(
    "[toggleDisabled] 切换禁用 →",
    editor.disabled ? "禁用(不可编辑，工具栏可见" : "正常",
  );
}

/**
 * 切换只读状态 / Toggle readonly state
 */
export function toggleReadonly(): void {
  if (!editor) return;
  editor.setReadonly(!editor.readonly);
  updateEditorStateLabel();
  console.log(
    "[toggleReadonly] 切换只读 →",
    editor.readonly ? "只读(不可编辑，工具栏隐藏)" : "正常",
  );
}

/**
 * 初始化编辑器 / Initialize editor
 */
export function initEditor(): void {
  const container = document.getElementById("editor-container");

  if (!container) {
    return;
  }

  editor = new Editor(container, {
    content: `<p><a href="blob:http://localhost:2000/4db822ab-8e7a-4da7-bfa4-fe86b463f672" target="_blank" rel="noopener noreferrer nofollow">logo.png</a><img id="7ba07856-b683-4d60-b503-102c79c046ff" src="https://cdn.uviewui.com/uview/goods/1.jpg" alt="二次元少女-动漫插画" title="二次元少女-动漫插画" style="width: 150px; height: auto; max-width: 100%; display: inline-block; cursor: pointer;"><video id="41cc4398-1836-4a86-a8a6-8c7392ef97d9" src="http://vjs.zencdn.net/v/oceans.mp4" alt="【哲风壁纸】丁达尔-晨光" title="【哲风壁纸】丁达尔-晨光" style="width: 150px; height: auto; max-width: 100%; display: inline-block; cursor: pointer;"></video><a href="https://baidu.com" target="_blank" rel="noopener noreferrer nofollow">百度一下</a></p>`,
    placeholder: "请输入...",
    theme: "dark",
    locale: "zh-CN",
    maxHeight: 400,
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
  updateEditorStateLabel();
}

/**
 * 销毁编辑器 / Destroy editor
 */
export function destroyEditor(): void {
  editor?.destroy();
  editor = null;
}
