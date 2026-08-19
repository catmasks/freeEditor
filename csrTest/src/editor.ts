// @ts-expect-error 忽略类型检查
import { Editor, i18n } from "@catmasks/free-editor";
// @ts-expect-error 忽略类型检查错误
import type { UploadResult, UploadContext } from "@catmasks/free-editor";

import { updateDemoTexts } from "./i18n";

export let editor: Editor | null = null;

/**
 * 生成一个模拟上传函数：延迟 delay 毫秒后返回文件本地 URL。
 * 供 image / video / attachment 三种媒体复用，避免重复代码。
 */
function mockUpload(delay: number) {
  return (file: File, ctx: UploadContext) =>
    new Promise<UploadResult>((resolve, reject) => {
      setTimeout(() => {
        if (ctx.signal?.aborted) {
          reject(new Error("Upload canceled"));
          return;
        }
        resolve({ url: URL.createObjectURL(file) });
      }, delay);
    });
}

/** 上传失败兜底：打印错误并弹出多语言提示。 */
function alertUploadFailed(error: Error, file: File): void {
  console.error("[upload error]", error.message, file);
  alert(i18n.t("upload.uploadFailed"));
}

/**
 * 更新状态栏文字 / Update status label text
 */
export function updateEditorStateLabel(): void {
  const label = document.getElementById("editor-state-label");
  if (!editor || !label) return;

  const { disabled, readonly } = editor;

  /** 同步按钮高亮状态 */
  document
    .getElementById("toggle-disabled")
    ?.classList.toggle("active", disabled);
  document
    .getElementById("toggle-readonly")
    ?.classList.toggle("active", readonly);

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
}

/**
 * 切换只读状态 / Toggle readonly state
 */
export function toggleReadonly(): void {
  if (!editor) return;
  editor.setReadonly(!editor.readonly);
  updateEditorStateLabel();
}

/**
 * 初始化编辑器 / Initialize editor
 */
export function initEditor(): void {
  const container = document.getElementById("editor-container");
  if (!container) return;

  editor = new Editor(container, {
    theme: "dark",
    locale: "zh-CN",
    uploader: {
      image: {
        maxSize: 5 * 1024 * 1024,
        accept: ["png"],
        format(result: { data: string }) {
          return { url: result.data };
        },
        upload: mockUpload(3000),
      },
      video: {
        maxSize: 500 * 1024 * 1024,
        accept: ["video/*"],
        onUploadError: alertUploadFailed,
        upload: mockUpload(3000),
      },
      attachment: {
        onUploadError: alertUploadFailed,
        upload: mockUpload(2000),
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
