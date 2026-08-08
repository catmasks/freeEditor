/**
 * ExportPdf Tiptap Extension
 */

import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { getEditorHTML, downloadFile } from "../../core/utils/export";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * 导出 PDF 选项
 */
export interface ExportPdfOptions {
  /**
   * 默认文件名
   */
  fileName?: string;
}

/**
 * 导出 HTML 为 PDF
 *
 * 使用 html2canvas 渲染编辑器内容为图片，再通过 jsPDF 生成 PDF 文件。
 * 支持长文档自动分页。
 */
async function exportHtmlToPdf(html: string, fileName: string): Promise<void> {
  // 创建隐藏 DOM 容器
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "794px";
  container.style.backgroundColor = "#ffffff";
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 计算 canvas 像素到 PDF mm 的转换比例
    const ratio = pdfWidth / canvasWidth;
    const scaledHeight = canvasHeight * ratio;

    let position = 0;
    let page = 0;

    while (position < scaledHeight) {
      if (page > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, "PNG", 0, position * -1, pdfWidth, scaledHeight);

      position += pdfHeight;
      page++;
    }

    const pdfBlob = pdf.output("blob");
    downloadFile(pdfBlob, fileName);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * ExportPdf 扩展
 */
export const ExportPdf = Extension.create<ExportPdfOptions>({
  name: "exportPdf",

  addOptions() {
    return {
      fileName: "freeEditor.pdf",
    };
  },

  addCommands() {
    return {
      exportPdf:
        () =>
        ({ editor }: { editor: Editor }) => {
          const html = getEditorHTML(editor);
          const fileName = this.options.fileName || "freeEditor.pdf";
          // 异步导出，不阻塞命令链
          exportHtmlToPdf(html, fileName).catch((err: unknown) => {
            console.error("[ExportPdf] 导出失败:", err);
          });
          return true;
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    exportPdf: {
      /**
       * 导出当前编辑器内容为 PDF 文档
       */
      exportPdf: () => ReturnType;
    };
  }
}
