import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { downloadFile } from "../../core/utils/export";

export interface ExportPdfOptions {
  fileName?: string;
}

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PDF_MARGIN_MM = 10;
const PDF_CONTENT_WIDTH_MM = A4_WIDTH_MM - PDF_MARGIN_MM * 2;
const PDF_CONTENT_HEIGHT_MM = A4_HEIGHT_MM - PDF_MARGIN_MM * 2;
const PDF_CONTENT_WIDTH_PX = 794;
const CANVAS_SCALE = 2;
const PDF_BOTTOM_SAFE_SPACE_PX = 24;

/**
 * 等待指定的毫秒数。
 *
 * Wait for the specified number of milliseconds.
 *
 * @param milliseconds - 等待的毫秒数 / Milliseconds to wait
 * @returns Promise 在指定时间后 resolve / Promise that resolves after the specified time
 */
function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

/**
 * 等待容器内所有图片加载完成。
 *
 * Wait for all images inside the container to finish loading.
 *
 * @param container - 包含图片的 DOM 元素 / DOM element containing images
 * @returns 所有图片加载完成后 resolve / Resolves when all images are loaded
 */
async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) {
    return;
  }
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          const handleLoad = () => {
            cleanup();
            resolve();
          };
          const handleError = () => {
            cleanup();
            resolve();
          };
          const cleanup = () => {
            image.removeEventListener("load", handleLoad);
            image.removeEventListener("error", handleError);
          };
          image.addEventListener("load", handleLoad, { once: true });
          image.addEventListener("error", handleError, { once: true });
        }),
    ),
  );
}

/**
 * 等待所有 Web 字体加载完成。
 * Wait for all web fonts to be loaded.
 *
 * @returns 字体加载完成后 resolve / Resolves when fonts are ready
 */
async function waitForFonts(): Promise<void> {
  if (!("fonts" in document)) {
    return;
  }
  try {
    await document.fonts.ready;
  } catch {}
}

/**
 * 等待浏览器完成布局计算。
 * Wait for the browser to finish layout calculations.
 * @returns 布局完成后 resolve / Resolves after layout is complete
 */
async function waitForLayout(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

/**
 * 从 Tiptap 编辑器中获取 ProseMirror DOM 元素。
 *
 * Get the ProseMirror DOM element from the Tiptap editor.
 *
 * @param editor - Tiptap 编辑器实例 / Tiptap editor instance
 * @returns ProseMirror 容器元素 / ProseMirror container element
 * @throws 如果找不到编辑器根元素或 ProseMirror 区域 / If root element or ProseMirror is not found
 */
function getProseMirrorElement(editor: Editor): HTMLElement {
  const root = editor.options.element;
  if (!(root instanceof HTMLElement)) {
    throw new Error("[ExportPdf] 无法获取编辑器根元素");
  }
  const proseMirror = root.querySelector(".ProseMirror");
  if (!(proseMirror instanceof HTMLElement)) {
    throw new Error("[ExportPdf] 未找到 ProseMirror 编辑区域");
  }
  return proseMirror;
}

/**
 * 创建用于 PDF 渲染的临时 DOM 容器。
 * Create a temporary DOM container for PDF rendering.
 * @param editor - Tiptap 编辑器实例 / Tiptap editor instance
 * @returns 包含容器和 ProseMirror 克隆的对象 / Object containing container and cloned ProseMirror
 */
function createPdfContainer(editor: Editor): {
  container: HTMLElement;
  proseMirror: HTMLElement;
} {
  const source = getProseMirrorElement(editor);
  const container = document.createElement("div");
  container.className = "free-editor__content";
  const proseMirror = source.cloneNode(true) as HTMLElement;
  proseMirror.classList.add("ProseMirror");
  proseMirror.removeAttribute("contenteditable");
  proseMirror.querySelectorAll(".ProseMirror-gapcursor").forEach((element) => {
    element.remove();
  });
  container.appendChild(proseMirror);
  Object.assign(container.style, {
    position: "absolute",
    left: "-100000px",
    top: "0",
    width: `${PDF_CONTENT_WIDTH_PX}px`,
    minHeight: "0",
    height: "auto",
    overflow: "visible",
    boxSizing: "border-box",
    background: "var(--editor-content-bg, #ffffff)",
    color: "var(--editor-text-default, #000000)",
    padding: "10px",
    margin: "0",
    zIndex: "-1",
  });
  Object.assign(proseMirror.style, {
    width: "100%",
    minHeight: "0",
    height: "auto",
    maxHeight: "none",
    overflow: "visible",
    boxSizing: "border-box",
  });
  document.body.appendChild(container);
  return {
    container,
    proseMirror,
  };
}

/**
 * 为 PDF 内容应用分页保护规则。
 * Apply pagination protection rules to PDF content.
 *
 * @param proseMirror - ProseMirror DOM 元素 / ProseMirror DOM element
 * @returns 注入的 style 元素，用于后续清理 / Injected style element for later cleanup
 */
function applyPdfPaginationRules(proseMirror: HTMLElement): HTMLStyleElement {
  const style = document.createElement("style");
  style.textContent = `
    .free-editor__content .ProseMirror p,
    .free-editor__content .ProseMirror h1,
    .free-editor__content .ProseMirror h2,
    .free-editor__content .ProseMirror h3,
    .free-editor__content .ProseMirror h4,
    .free-editor__content .ProseMirror h5,
    .free-editor__content .ProseMirror h6,
    .free-editor__content .ProseMirror blockquote,
    .free-editor__content .ProseMirror pre,
    .free-editor__content .ProseMirror li,
    .free-editor__content .ProseMirror .task-item {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .free-editor__content .ProseMirror table {
      break-inside: auto;
      page-break-inside: auto;
    }
    .free-editor__content .ProseMirror tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .free-editor__content .ProseMirror thead {
      display: table-header-group;
    }
    .free-editor__content .ProseMirror tfoot {
      display: table-footer-group;
    }
    .free-editor__content .ProseMirror img {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .free-editor__content .ProseMirror hr {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  `;
  proseMirror.appendChild(style);
  return style;
}

/**
 * 清理临时 DOM 中不应出现在 PDF 中的编辑器交互元素。
 *
 * Clean up editor interactive elements that should not appear in the PDF.
 *
 * @param container - PDF 临时容器 / PDF temporary container
 */
function cleanupPdfOnlyElements(container: HTMLElement): void {
  container
    .querySelectorAll(".is-empty[data-placeholder]")
    .forEach((element) => {
      element.removeAttribute("data-placeholder");
      element.classList.remove("is-empty");
    });
  container.querySelectorAll(".ProseMirror-selectednode").forEach((element) => {
    element.classList.remove("ProseMirror-selectednode");
  });
  container.querySelectorAll(".ProseMirror-gapcursor").forEach((element) => {
    element.remove();
  });
}

/**
 * 将 Canvas 按 A4 页面切割并生成 PDF 文档。
 *
 * Split the Canvas into A4 pages and generate a PDF document.
 *
 * 根据 A4 页面高度逐页裁切 Canvas，避免内容缩放或溢出。
 * Cuts the Canvas page by page according to A4 page height, avoiding scaling or overflow.
 *
 * @param canvas - html2canvas 生成的完整 Canvas / Full Canvas generated by html2canvas
 * @returns jsPDF 实例 / jsPDF instance
 * @throws 如果无法创建 Canvas 2D 上下文 / If Canvas 2D context cannot be created
 */
function createPdfFromCanvas(canvas: HTMLCanvasElement): jsPDF {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  const ratio = PDF_CONTENT_WIDTH_MM / canvas.width;
  const pageCanvasHeight = Math.floor(PDF_CONTENT_HEIGHT_MM / ratio);
  let sourceY = 0;
  let pageIndex = 0;
  while (sourceY < canvas.height) {
    const remainingHeight = canvas.height - sourceY;
    const currentCanvasHeight = Math.min(pageCanvasHeight, remainingHeight);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = currentCanvasHeight;
    const pageContext = pageCanvas.getContext("2d");
    if (!pageContext) {
      throw new Error("[ExportPdf] 无法创建 Canvas 2D 上下文");
    }
    pageContext.fillStyle = "#ffffff";
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageContext.drawImage(
      canvas,
      0,
      sourceY,
      canvas.width,
      currentCanvasHeight,
      0,
      0,
      canvas.width,
      currentCanvasHeight,
    );
    const imageData = pageCanvas.toDataURL("image/png");
    const imageHeight = currentCanvasHeight * ratio;
    if (pageIndex > 0) {
      pdf.addPage();
    }
    pdf.addImage(
      imageData,
      "PNG",
      PDF_MARGIN_MM,
      PDF_MARGIN_MM,
      PDF_CONTENT_WIDTH_MM,
      imageHeight,
      undefined,
      "FAST",
    );
    sourceY += currentCanvasHeight;
    pageIndex++;
  }
  return pdf;
}

/**
 * 将当前编辑器内容导出为 PDF 文件。
 *
 * Export the current editor content as a PDF file.
 *
 * @param editor - Tiptap 编辑器实例 / Tiptap editor instance
 * @param fileName - 导出的 PDF 文件名 / Exported PDF file name
 * @returns Promise，导出完成或失败时 resolve / Promise that resolves when export completes or fails
 */
async function exportEditorToPdf(
  editor: Editor,
  fileName: string,
): Promise<void> {
  let container: HTMLElement | null = null;
  let paginationStyle: HTMLStyleElement | null = null;
  try {
    const result = createPdfContainer(editor);
    container = result.container;
    const proseMirror = result.proseMirror;
    paginationStyle = applyPdfPaginationRules(proseMirror);
    cleanupPdfOnlyElements(container);
    await waitForFonts();
    await waitForImages(container);
    void container.offsetHeight;
    void proseMirror.offsetHeight;
    void proseMirror.scrollHeight;
    await waitForLayout();
    await wait(50);
    const width = Math.ceil(
      Math.max(
        proseMirror.scrollWidth,
        proseMirror.offsetWidth,
        PDF_CONTENT_WIDTH_PX,
      ),
    );
    const contentHeight = Math.ceil(
      Math.max(proseMirror.scrollHeight, proseMirror.offsetHeight),
    );
    const height = contentHeight + PDF_BOTTOM_SAFE_SPACE_PX;
    if (width <= 0 || contentHeight <= 0) {
      throw new Error("[ExportPdf] 编辑器内容为空");
    }
    const canvas = await html2canvas(container, {
      scale: CANVAS_SCALE,
      width,
      height,
      windowWidth: width,
      windowHeight: Math.max(height, document.documentElement.clientHeight),
      backgroundColor: "#ffffff",
      useCORS: true,
      imageTimeout: 15000,
      logging: false,
      removeContainer: false,
    });
    if (canvas.width <= 0 || canvas.height <= 0) {
      throw new Error("[ExportPdf] PDF 渲染结果为空");
    }
    const pdf = createPdfFromCanvas(canvas);
    const blob = pdf.output("blob");
    downloadFile(blob, fileName);
  } finally {
    if (paginationStyle) {
      paginationStyle.remove();
    }
    if (container) {
      container.remove();
    }
  }
}

/**
 * ExportPdf Tiptap 扩展。
 *
 * ExportPdf Tiptap extension.
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
          const fileName = this.options.fileName || "freeEditor.pdf";
          exportEditorToPdf(editor, fileName).catch((error: unknown) => {
            console.error("[ExportPdf] 导出失败:", error);
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
       * 导出当前编辑器内容为 PDF 文档。
       * Export the current editor content as a PDF document.
       */
      exportPdf: () => ReturnType;
    };
  }
}
