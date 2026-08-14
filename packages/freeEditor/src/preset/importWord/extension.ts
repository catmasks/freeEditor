import { Extension } from "@tiptap/core";
import type { Editor, CommandProps } from "@tiptap/core";

import mammoth from "mammoth";

import type { UploadGenerator } from "../../core/types";

/**
 * Data URL 图片数据结构。
 * Data URL image data structure.
 */
interface DataUrlImage {
  /**
   * 图片 MIME 类型。
   * Image MIME type.
   */
  mime: string;

  /**
   * Base64 编码的图片数据。
   * Base64 encoded image data.
   */
  base64: string;
}

/**
 * 解析图片 Data URL。
 * Parse image Data URL.
 *
 * 支持格式：
 * Supported formats:
 *
 * data:image/png;base64,xxxx
 * data:image/jpeg;base64,xxxx
 *
 * @param src - 图片 URL 字符串 / Image URL string.
 * @returns 解析后的图片数据，或 null / Parsed image data or null.
 */
function parseDataUrl(src: string): DataUrlImage | null {
  if (!src.startsWith("data:image/")) {
    return null;
  }

  const match = src.match(/^data:(image\/[^;]+);base64,(.+)$/s);

  if (!match) {
    return null;
  }

  return {
    mime: match[1],
    base64: match[2],
  };
}

/**
 * 将 Base64 字符串转换为 ArrayBuffer。
 * Convert Base64 string to ArrayBuffer.
 *
 * @param base64 - Base64 字符串 / Base64 string.
 * @returns ArrayBuffer 数据 / ArrayBuffer data.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  const chunkSize = 0x8000;

  for (let offset = 0; offset < binary.length; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, binary.length);

    for (let index = offset; index < end; index++) {
      bytes[index] = binary.charCodeAt(index);
    }
  }

  return bytes.buffer;
}

/**
 * 根据 MIME 类型获取图片文件扩展名。
 * Get image file extension from MIME type.
 *
 * @param mime - MIME 类型 / MIME type.
 * @returns 文件扩展名（不含点） / File extension (without dot).
 */
function getImageExtension(mime: string): string {
  const extensionMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
    "image/bmp": "bmp",
    "image/tiff": "tiff",
  };

  return extensionMap[mime.toLowerCase()] || mime.split("/")[1] || "png";
}

/**
 * 将 Data URL 转换为 File 对象。
 * Convert Data URL to File object.
 *
 * @param src - Data URL 字符串 / Data URL string.
 * @param name - 文件名（不含扩展名） / File name (without extension).
 * @returns File 对象或 null / File object or null.
 */
function dataUrlToFile(src: string, name = "word-image"): File | null {
  const data = parseDataUrl(src);

  if (!data) {
    return null;
  }

  const buffer = base64ToArrayBuffer(data.base64);

  const blob = new Blob([buffer], {
    type: data.mime,
  });

  const extension = getImageExtension(data.mime);

  return new File([blob], `${name}.${extension}`, {
    type: data.mime,
  });
}

/**
 * Word 私有 CSS 属性前缀列表。
 * List of Word private CSS property prefixes.
 */
const WORD_STYLE_PREFIXES = ["mso-", "-mso-"];

/**
 * 判断 CSS 属性名是否为 Word 私有属性。
 * Check if a CSS property is Word private.
 *
 * @param property - CSS 属性名 / CSS property name.
 * @returns 是否为私有属性 / Whether it is private.
 */
function isWordPrivateStyle(property: string): boolean {
  const normalized = property.trim().toLowerCase();

  return WORD_STYLE_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

/**
 * 清理元素上的 Word 私有样式，保留通用 CSS。
 * Clean Word private styles from element, keep common CSS.
 *
 * @param element - 目标 HTML 元素 / Target HTML element.
 */
function sanitizeElementStyle(element: HTMLElement): void {
  const style = element.style;

  if (!style.length) {
    return;
  }

  const declarations: Array<[string, string]> = [];

  for (let index = 0; index < style.length; index++) {
    const property = style[index];

    if (!property) {
      continue;
    }

    if (isWordPrivateStyle(property)) {
      continue;
    }

    const value = style.getPropertyValue(property).trim();

    if (!value) {
      continue;
    }

    declarations.push([property, value]);
  }

  style.cssText = "";

  for (const [property, value] of declarations) {
    style.setProperty(property, value);
  }

  if (!style.length) {
    element.removeAttribute("style");
  }
}

/**
 * 清理元素上的 Word 私有 HTML 属性（如 class、mso-* 等）。
 * Clean Word private HTML attributes (class, mso-*, etc.) from element.
 *
 * @param element - 目标 HTML 元素 / Target HTML element.
 */
function normalizeElementAttributes(element: HTMLElement): void {
  /**
   * 清理 class 属性。
   * Clean class attribute.
   */
  if (element.hasAttribute("class")) {
    const className = element.getAttribute("class") || "";

    const classes = className
      .split(/\s+/)
      .filter(Boolean)
      .filter((name) => !/^Mso/i.test(name) && !/^msolist/i.test(name));

    if (classes.length) {
      element.setAttribute("class", classes.join(" "));
    } else {
      element.removeAttribute("class");
    }
  }

  /**
   * 移除 Word 私有属性。
   * Remove Word private attributes.
   */
  const attributes = Array.from(element.attributes);

  for (const attribute of attributes) {
    const name = attribute.name.toLowerCase();

    if (
      name.startsWith("mso-") ||
      name.startsWith("w:") ||
      name.startsWith("o:")
    ) {
      element.removeAttribute(attribute.name);
    }
  }

  /**
   * 清理样式。
   * Clean styles.
   */
  sanitizeElementStyle(element);

  /**
   * 移除空 class / style。
   * Remove empty class/style.
   */
  if (element.hasAttribute("class") && !element.getAttribute("class")?.trim()) {
    element.removeAttribute("class");
  }

  if (element.hasAttribute("style") && !element.getAttribute("style")?.trim()) {
    element.removeAttribute("style");
  }
}

/**
 * 将仍以 style 表示的格式转换为对应的语义化标签。
 * Convert style-based formatting to semantic HTML tags.
 *
 * @param root - 根 HTML 元素 / Root HTML element.
 */
function transformSemanticStyles(root: HTMLElement): void {
  const spans = Array.from(root.querySelectorAll("span"));

  for (const span of spans) {
    const element = span as HTMLElement;
    sanitizeElementStyle(element);

    const style = element.style;

    // 检测需要转换的样式 / Detect styles to convert
    const textDecoration = (
      style.getPropertyValue("text-decoration-line") ||
      style.getPropertyValue("text-decoration")
    ).toLowerCase();
    const verticalAlign = style
      .getPropertyValue("vertical-align")
      .toLowerCase();
    const fontWeight = style.getPropertyValue("font-weight").toLowerCase();
    const fontStyle = style.getPropertyValue("font-style").toLowerCase();

    let targetTag: string | null = null;

    // 按优先级选择语义标签 / Select semantic tags by priority
    if (textDecoration.includes("underline")) {
      targetTag = "u";
    } else if (textDecoration.includes("line-through")) {
      targetTag = "del";
    } else if (verticalAlign === "super" || verticalAlign === "superscript") {
      targetTag = "sup";
    } else if (verticalAlign === "sub" || verticalAlign === "subscript") {
      targetTag = "sub";
    } else if (
      fontWeight === "bold" ||
      fontWeight === "bolder" ||
      Number(fontWeight) >= 600
    ) {
      targetTag = "strong";
    } else if (fontStyle === "italic" || fontStyle === "oblique") {
      targetTag = "em";
    }

    if (!targetTag) continue;

    // 创建新标签 / Create new element
    const newElement = element.ownerDocument.createElement(targetTag);

    // 复制原 span 的所有属性 / Copy all attributes from original span except style
    for (const attr of Array.from(element.attributes)) {
      if (attr.name === "style") continue; // 稍后单独处理
      newElement.setAttribute(attr.name, attr.value);
    }

    // 复制样式：移除已经转换为语义标签的属性，保留其余属性
    const newStyle = newElement.style;
    const cssText = style.cssText;

    // 将原样式完整复制，然后删除已转换的属性
    newStyle.cssText = cssText;

    if (targetTag === "u") {
      newStyle.removeProperty("text-decoration-line");
      newStyle.removeProperty("text-decoration");
    } else if (targetTag === "del") {
      newStyle.removeProperty("text-decoration-line");
      newStyle.removeProperty("text-decoration");
    } else if (targetTag === "sup" || targetTag === "sub") {
      newStyle.removeProperty("vertical-align");
    } else if (targetTag === "strong") {
      newStyle.removeProperty("font-weight");
    } else if (targetTag === "em") {
      newStyle.removeProperty("font-style");
    }

    // 如果新标签没有 style 内容，移除 style 属性 / Remove style attribute if empty
    if (!newStyle.length) {
      newElement.removeAttribute("style");
    }

    // 移动子节点 / Move child nodes to new element
    while (element.firstChild) {
      newElement.appendChild(element.firstChild);
    }

    element.replaceWith(newElement);
  }
}

/**
 * 将表格的第一行转换为表头（`<thead>`），如果尚未存在。
 * Convert the first row of a table to header (`<thead>`) if not already present.
 *
 * @param root - 根 HTML 元素 / Root HTML element.
 */
function normalizeTableHeader(root: HTMLElement): void {
  const tables = Array.from(root.querySelectorAll("table"));

  for (const table of tables) {
    /**
     * 跳过已有 thead 的表格。
     * Skip tables that already have a thead.
     */
    const existingHeader = table.querySelector(":scope > thead > tr");

    if (existingHeader) {
      continue;
    }

    /**
     * 获取第一行。
     * Get the first row.
     */
    const firstRow = table.querySelector(":scope > tbody > tr, :scope > tr");

    if (!firstRow) {
      continue;
    }

    /**
     * 将 td 转换为 th。
     * Convert td to th.
     */
    const cells = Array.from(firstRow.children);

    for (const cell of cells) {
      if (cell.tagName.toLowerCase() !== "td") {
        continue;
      }

      const th = table.ownerDocument.createElement("th");

      /**
       * 保留跨列/行属性。
       * Preserve colspan/rowspan.
       */
      if (cell.hasAttribute("colspan")) {
        th.setAttribute("colspan", cell.getAttribute("colspan") || "1");
      }

      if (cell.hasAttribute("rowspan")) {
        th.setAttribute("rowspan", cell.getAttribute("rowspan") || "1");
      }

      /**
       * 移动子节点。
       * Move child nodes.
       */
      while (cell.firstChild) {
        th.appendChild(cell.firstChild);
      }

      cell.replaceWith(th);
    }

    /**
     * 创建 thead 并插入。
     * Create thead and insert.
     */
    const thead = table.ownerDocument.createElement("thead");

    firstRow.remove();

    thead.appendChild(firstRow);

    const tbody = table.querySelector(":scope > tbody");

    if (tbody) {
      table.insertBefore(thead, tbody);
    } else {
      table.insertBefore(thead, table.firstChild);
    }
  }
}

/**
 * 清理表格相关元素的属性。
 * Clean attributes of table-related elements.
 *
 * @param root - 根 HTML 元素 / Root HTML element.
 */
function normalizeTables(root: HTMLElement): void {
  const elements = Array.from(
    root.querySelectorAll("table, thead, tbody, tfoot, tr, th, td"),
  );

  for (const node of elements) {
    normalizeElementAttributes(node as HTMLElement);
  }
}

/**
 * 移除无意义的空 `span` 元素。
 * Remove meaningless empty `span` elements.
 *
 * 注意：不删除 p, div, strong, em, u, del, sup, sub 等，避免破坏文档结构。
 * Note: Does not delete p, div, strong, em, u, del, sup, sub to avoid breaking structure.
 *
 * @param root - 根 HTML 元素 / Root HTML element.
 */
function removeEmptyInlineElements(root: HTMLElement): void {
  const elements = Array.from(root.querySelectorAll("span"));

  for (const node of elements) {
    const element = node as HTMLElement;

    if (element.children.length === 0 && !(element.textContent || "").trim()) {
      element.remove();
    }
  }
}

/**
 * 对 Mammoth 生成的 HTML 进行清理和规范化。
 * Clean and normalize the HTML generated by Mammoth.
 *
 * @param html - 原始 HTML 字符串 / Raw HTML string.
 * @returns 规范化后的 HTML 字符串 / Normalized HTML string.
 */
function transformMammothHtml(html: string): string {
  const parser = new DOMParser();

  const doc = parser.parseFromString(html, "text/html");

  const body = doc.body;

  /**
   * 清理所有元素。
   * Clean all elements.
   */
  const elements = Array.from(body.querySelectorAll("*"));

  for (const node of elements) {
    normalizeElementAttributes(node as HTMLElement);
  }

  /**
   * 语义格式转换。
   * Semantic style conversion.
   */
  transformSemanticStyles(body);

  /**
   * 表格属性清理。
   * Clean table attributes.
   */
  normalizeTables(body);

  /**
   * 表头转换。
   * Table header conversion.
   */
  normalizeTableHeader(body);

  /**
   * 移除空 span。
   * Remove empty spans.
   */
  removeEmptyInlineElements(body);

  return body.innerHTML;
}

/**
 * 处理 Word 文档中的图片。
 * Process images in Word document.
 *
 * @param html - 包含图片的 HTML 字符串 / HTML string with images.
 * @param uploader - 上传器实例（可选） / Uploader instance (optional).
 * @returns 处理后的 HTML 字符串 / Processed HTML string.
 */
async function processWordImages(
  html: string,
  uploader?: UploadGenerator,
): Promise<string> {
  /**
   * 无 uploader 则直接返回。
   * Return as-is if no uploader.
   */
  if (!uploader || typeof uploader.uploadFile !== "function") {
    return html;
  }

  const parser = new DOMParser();

  const doc = parser.parseFromString(html, "text/html");

  const images = Array.from(doc.body.querySelectorAll("img"));

  if (!images.length) {
    return html;
  }

  /**
   * 并行上传所有图片。
   * Upload all images in parallel.
   */
  await Promise.all(
    images.map(async (image, index) => {
      const src = image.getAttribute("src");

      if (!src) {
        return;
      }

      const file = dataUrlToFile(src, `word-image-${index + 1}`);

      if (!file) {
        /**
         * 不是有效的 Data URL，跳过。
         * Not a valid Data URL, skip.
         */
        return;
      }

      try {
        const result = await uploader.uploadFile(file, "image");

        if (result?.url) {
          image.setAttribute("src", result.url);

          /**
           * 如果有返回的名称，保存为 data-name。
           * If name is returned, save as data-name.
           */
          if (result.name) {
            image.setAttribute("data-name", result.name);
          }
        }
      } catch (error) {
        console.error("[ImportWord] Word 上传失败，使用 Data URL:", error);
      }
    }),
  );

  return doc.body.innerHTML;
}

/**
 * 导入 Word 文档并插入到编辑器。
 * Import a Word document and insert into the editor.
 *
 * @param file - Word 文件 (DOCX) / Word file (DOCX).
 * @param editor - Tiptap 编辑器实例 / Tiptap editor instance.
 * @returns 是否导入成功 / Whether import succeeded.
 */
async function importDocxToEditor(
  file: File,
  editor: Editor,
): Promise<boolean> {
  try {
    /**
     * 读取文件内容。
     * Read file content.
     */
    const arrayBuffer = await file.arrayBuffer();

    /**
     * 获取上传器（从编辑器存储中）。
     * Get uploader from editor storage.
     */
    const uploader = editor.storage.mediaUploader as
      | UploadGenerator
      | undefined;

    /**
     * 使用 Mammoth 将 DOCX 转为 HTML。
     *
     * 不自定义图片转换，
     * Mammoth 默认会将图片转换为 Data URL。
     *
     * Convert DOCX to HTML using Mammoth.
     * Images are converted to Data URLs by Mammoth.
     */
    const result = await mammoth.convertToHtml(
      { arrayBuffer },
      {
        styleMap: [
          "u => u", // 下划线
          "strike => del", // 删除线
        ],
        includeDefaultStyleMap: true,
      },
    );
    /**
     * 输出 Mammoth 转换过程中的警告和信息。
     * Output Mammoth conversion warnings and messages.
     */
    if (result.messages?.length) {
      console.warn("[ImportWord] Mammoth messages:", result.messages);
    }

    /**
     * 无内容则返回。
     * Return if no content.
     */
    if (!result.value) {
      return false;
    }

    /**
     * HTML 清理与规范化。
     * Clean and normalize HTML.
     */
    let html = transformMammothHtml(result.value);

    /**
     * 图片上传。
     *
     * 这里只修改内存中的 HTML，
     * 不直接向 ProseMirror 插入图片节点。
     */
    html = await processWordImages(html, uploader);
    /**
     * 最终 HTML 为空则返回。
     */
    if (!html) {
      return false;
    }

    /**
     * 一次性插入编辑器。
     */
    editor.commands.insertContent(html);

    return true;
  } catch (error) {
    console.error("[ImportWord] 导入 Word 文档失败:", error);

    return false;
  }
}

/**
 * ImportWord Tiptap 扩展。
 * ImportWord Tiptap extension.
 */
export const ImportWord = Extension.create({
  name: "importWord",

  addCommands() {
    return {
      /**
       * 导入 Word 文档。
       * Import a Word document.
       *
       * @param file - DOCX 文件 / DOCX file.
       * @returns 返回 true 表示已启动导入过程，实际结果异步处理。
       *          Returns true to indicate the import process has started; actual result is handled asynchronously.
       */
      importWord:
        (file: File) =>
        ({ editor }: CommandProps) => {
          if (!file) {
            return false;
          }

          /**
           * 异步执行导入。
           * Execute import asynchronously.
           */
          importDocxToEditor(file, editor).catch((error) => {
            console.error("[ImportWord] 导入失败:", error);
          });

          /**
           * 立即返回 true，表示命令已执行。
           * Return true immediately, indicating command executed.
           */
          return true;
        },
    };
  },
});

/**
 * 扩展 Tiptap 命令类型声明。
 * Extend Tiptap command type declarations.
 */
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    importWord: {
      /**
       * 导入 Word 文档内容。
       * Import Word document content.
       *
       * @param file - Word 文件 (DOCX) / Word file (DOCX).
       * @returns 命令执行结果 / Command execution result.
       */
      importWord: (file: File) => ReturnType;
    };
  }
}
