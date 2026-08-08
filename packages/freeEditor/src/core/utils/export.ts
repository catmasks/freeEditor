import type { Editor } from "@tiptap/core";
import { saveAs } from "file-saver";

/**
 * 获取编辑器 HTML 内容
 * @param editor 编辑器实例
 * @returns HTML 内容
 */
export function getEditorHTML(editor: Editor): string {
  return editor.getHTML();
}

/**
 * 下载文件
 * @param blob 文件内容
 * @param fileName 文件名
 */
export function downloadFile(blob: Blob, fileName: string): void {
  saveAs(blob, fileName);
}
