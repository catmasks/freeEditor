import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { Mark } from "@tiptap/pm/model";

import { downloadFile } from "../../core/utils/export";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  LevelFormat,
  UnderlineType,
  ImageRun,
  ExternalHyperlink,
} from "docx";

/**
 * 编号配置（用于列表）。
 * Numbering configuration for lists.
 */
const numberingConfig = [
  {
    reference: "bullet-list",
    levels: [
      {
        level: 0,
        format: LevelFormat.BULLET,
        text: "\u2022",
        alignment: AlignmentType.LEFT,
      },
      {
        level: 1,
        format: LevelFormat.BULLET,
        text: "\u25CB",
        alignment: AlignmentType.LEFT,
      },
      {
        level: 2,
        format: LevelFormat.BULLET,
        text: "\u25A0",
        alignment: AlignmentType.LEFT,
      },
    ],
  },
  {
    reference: "ordered-list",
    levels: [
      {
        level: 0,
        format: LevelFormat.DECIMAL,
        text: "%1.",
        alignment: AlignmentType.LEFT,
      },
      {
        level: 1,
        format: LevelFormat.LOWER_LETTER,
        text: "%1.",
        alignment: AlignmentType.LEFT,
      },
      {
        level: 2,
        format: LevelFormat.LOWER_ROMAN,
        text: "%1.",
        alignment: AlignmentType.LEFT,
      },
    ],
  },
] as const;

/**
 * 图片最大宽度（像素）。
 * Maximum image width in pixels.
 */
const IMAGE_MAX_WIDTH = 450;

/**
 * 图片默认宽度（像素）。
 * Default image width in pixels.
 */
const IMAGE_DEFAULT_WIDTH = 100;

/**
 * 图片默认高度（像素）。
 * Default image height in pixels.
 */
const IMAGE_DEFAULT_HEIGHT = 100;

/**
 * 图片缓存（避免重复请求同一 URL）。
 * Image cache to avoid duplicate requests for the same URL.
 */
const imageCache = new Map<string, Uint8Array | null>();

/**
 * 列表类型：无序、有序或 null。
 * List type: bullet, ordered, or null.
 */
type ListType = "bullet" | "ordered" | null;

/**
 * 转换上下文（保存当前列表层级和类型）。
 * Conversion context (stores current list level and type).
 */
interface ConvertContext {
  /** 当前列表嵌套层级 / Current list nesting level */
  listLevel: number;
  /** 当前列表类型 / Current list type */
  listType: ListType;
}

/**
 * 创建转换上下文。
 * Creates a conversion context.
 *
 * @param overrides - 部分覆盖的上下文属性 / Partial overrides for context properties
 * @returns 转换上下文对象 / Conversion context object
 */
function createContext(overrides?: Partial<ConvertContext>): ConvertContext {
  return {
    listLevel: 0,
    listType: null,
    ...overrides,
  };
}

/**
 * 标题级别到 DOCX HeadingLevel 的映射。
 * Mapping from heading level to DOCX HeadingLevel.
 */
const headingLevelMap: Record<
  number,
  (typeof HeadingLevel)[keyof typeof HeadingLevel]
> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
};

/**
 * 根据图片 URL 推断图片类型。
 * Infers image type from its URL.
 *
 * @param src - 图片 URL / Image URL
 * @returns DOCX 支持的图片类型 / DOCX-supported image type
 */
function inferImageType(src: string): "jpg" | "png" | "gif" | "bmp" {
  const cleanSrc = src.split("?")[0].split("#")[0];

  const extension = cleanSrc.split(".").pop()?.toLowerCase() ?? "";

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "jpg";

    case "gif":
      return "gif";

    case "bmp":
      return "bmp";

    case "png":
    default:
      return "png";
  }
}

/**
 * 解析 CSS 尺寸值（支持 px、pt、em、rem、%）。
 * Parses CSS size values (supports px, pt, em, rem, %).
 *
 * @param value - CSS 尺寸字符串 / CSS size string
 * @returns 像素值（数值）或 undefined / Pixel value or undefined
 */
function parseCssSize(value: unknown): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim().toLowerCase();

  if (!trimmed || trimmed === "auto") {
    return undefined;
  }

  const match = trimmed.match(/^([\d.]+)(px|pt|em|rem|%)?$/);

  if (!match) {
    return undefined;
  }

  const number = Number(match[1]);

  if (!Number.isFinite(number)) {
    return undefined;
  }

  const unit = match[2] ?? "px";

  switch (unit) {
    case "pt":
      return Math.round(number * 1.333);

    case "em":
    case "rem":
      return Math.round(number * 16);

    case "%":
      return Math.round((number * IMAGE_MAX_WIDTH) / 100);

    case "px":
    default:
      return Math.round(number);
  }
}

/**
 * 获取图片尺寸（优先使用 width/height，若只有一个则按比例缩放）。
 * Gets image dimensions (prefers width/height, scales proportionally if only one is given).
 *
 * @param attrs - 图片属性对象 / Image attributes object
 * @returns 包含 width 和 height 的对象 / Object with width and height
 */
function getImageSize(attrs: Record<string, unknown>): {
  width: number;
  height: number;
} {
  const width = parseCssSize(attrs.width) ?? IMAGE_DEFAULT_WIDTH;

  const height = parseCssSize(attrs.height) ?? IMAGE_DEFAULT_HEIGHT;

  let finalWidth = width;
  let finalHeight = height;

  if (finalWidth > IMAGE_MAX_WIDTH) {
    finalHeight = Math.round((finalHeight * IMAGE_MAX_WIDTH) / finalWidth);

    finalWidth = IMAGE_MAX_WIDTH;
  }

  return {
    width: Math.max(1, finalWidth),
    height: Math.max(1, finalHeight),
  };
}

/**
 * 将 CSS 颜色转换为 DOCX 支持的 6 位 HEX 格式（支持 #rgb, #rrggbb, rgb(), rgba()）。
 * Converts CSS color to DOCX-compatible 6‑digit HEX (supports #rgb, #rrggbb, rgb(), rgba()).
 *
 * @param color - CSS 颜色值 / CSS color value
 * @returns 6 位 HEX 字符串或 undefined / 6‑digit HEX string or undefined
 */
function normalizeColor(color: unknown): string | undefined {
  if (typeof color !== "string") {
    return undefined;
  }

  const value = color.trim();

  if (!value) {
    return undefined;
  }

  if (value.startsWith("#")) {
    const hex = value.slice(1);

    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
      return hex
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
        .toUpperCase();
    }

    if (/^[0-9a-fA-F]{6}$/.test(hex)) {
      return hex.toUpperCase();
    }

    return undefined;
  }

  const rgbMatch = value.match(
    /^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)(?:\s*[,/]\s*[\d.%]+)?\s*\)$/i,
  );

  if (!rgbMatch) {
    return undefined;
  }

  const r = Math.max(0, Math.min(255, Number(rgbMatch[1])));

  const g = Math.max(0, Math.min(255, Number(rgbMatch[2])));

  const b = Math.max(0, Math.min(255, Number(rgbMatch[3])));

  return [r, g, b]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/**
 * 将 CSS 字体大小转换为 DOCX half‑point 单位（12pt = 24 half‑points）。
 * Converts CSS font size to DOCX half‑point units (12pt = 24 half‑points).
 *
 * @param value - CSS 字体大小值 / CSS font size value
 * @returns half‑point 值或 undefined / half‑point value or undefined
 */
function parseFontSizeToHalfPoint(value: unknown): number | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const match = value
    .trim()
    .toLowerCase()
    .match(/^([\d.]+)(px|pt)?$/);

  if (!match) {
    return undefined;
  }

  const number = Number(match[1]);

  if (!Number.isFinite(number)) {
    return undefined;
  }

  const unit = match[2] ?? "pt";

  if (unit === "px") {
    return Math.round((number / 1.333) * 2);
  }

  return Math.round(number * 2);
}

/**
 * 将 Tiptap 对齐值映射为 DOCX AlignmentType。
 * Maps Tiptap alignment value to DOCX AlignmentType.
 *
 * @param alignment - Tiptap 对齐字符串 / Tiptap alignment string
 * @returns DOCX 对齐类型或 undefined / DOCX alignment type or undefined
 */
function getDocxAlignment(
  alignment: unknown,
): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
  if (typeof alignment !== "string") {
    return undefined;
  }

  switch (alignment) {
    case "left":
      return AlignmentType.LEFT;

    case "center":
      return AlignmentType.CENTER;

    case "right":
      return AlignmentType.RIGHT;

    case "justify":
      return AlignmentType.JUSTIFIED;

    default:
      return undefined;
  }
}

/**
 * TextRun 样式选项。
 * TextRun style options.
 */
interface TextRunOptions {
  bold?: boolean;
  italics?: boolean;
  strike?: boolean;
  underline?: {
    type: (typeof UnderlineType)[keyof typeof UnderlineType];
  };
  superScript?: boolean;
  subScript?: boolean;
  font?: string;
  size?: number;
  color?: string;
  shading?: {
    fill: string;
    type: "clear";
  };
}

/**
 * 从 ProseMirror marks 提取 TextRun 样式选项。
 * Extracts TextRun style options from ProseMirror marks.
 *
 * @param marks - ProseMirror marks 数组 / Array of ProseMirror marks
 * @returns TextRun 样式选项 / TextRun style options
 */
function getTextRunOptions(marks: readonly Mark[]): TextRunOptions {
  let bold: boolean | undefined;

  let italics: boolean | undefined;

  let strike: boolean | undefined;

  let underline:
    | {
        type: (typeof UnderlineType)[keyof typeof UnderlineType];
      }
    | undefined;

  let superScript: boolean | undefined;

  let subScript: boolean | undefined;

  let font: string | undefined;

  let size: number | undefined;

  let color: string | undefined;

  let shading:
    | {
        fill: string;
        type: "clear";
      }
    | undefined;

  let isInlineCode = false;

  for (const mark of marks) {
    switch (mark.type.name) {
      case "bold":
        bold = true;
        break;

      case "italic":
        italics = true;
        break;

      case "underline":
        underline = {
          type: UnderlineType.SINGLE,
        };
        break;

      case "strike":
        strike = true;
        break;

      case "superscript":
        superScript = true;
        break;

      case "subscript":
        subScript = true;
        break;

      case "code":
      case "inlineCode":
        isInlineCode = true;
        break;

      case "textStyle": {
        const attrs = mark.attrs as {
          fontSize?: unknown;
          fontFamily?: unknown;
          color?: unknown;
          backgroundColor?: unknown;
        };

        if (attrs.fontSize) {
          const parsedSize = parseFontSizeToHalfPoint(attrs.fontSize);

          if (parsedSize !== undefined) {
            size = parsedSize;
          }
        }

        if (typeof attrs.fontFamily === "string" && attrs.fontFamily.trim()) {
          font = attrs.fontFamily.trim();
        }

        const normalizedColor = normalizeColor(attrs.color);

        if (normalizedColor) {
          color = normalizedColor;
        }

        const normalizedBackground = normalizeColor(attrs.backgroundColor);

        if (normalizedBackground) {
          shading = {
            fill: normalizedBackground,
            type: "clear",
          };
        }

        break;
      }

      case "style": {
        const attrs = mark.attrs as {
          fontSize?: unknown;
          fontFamily?: unknown;
          color?: unknown;
          backgroundColor?: unknown;
        };

        if (attrs.fontSize) {
          const parsedSize = parseFontSizeToHalfPoint(attrs.fontSize);

          if (parsedSize !== undefined) {
            size = parsedSize;
          }
        }

        if (typeof attrs.fontFamily === "string" && attrs.fontFamily.trim()) {
          font = attrs.fontFamily.trim();
        }

        const normalizedColor = normalizeColor(attrs.color);

        if (normalizedColor) {
          color = normalizedColor;
        }

        const normalizedBackground = normalizeColor(attrs.backgroundColor);

        if (normalizedBackground) {
          shading = {
            fill: normalizedBackground,
            type: "clear",
          };
        }

        break;
      }

      default:
        break;
    }
  }

  if (isInlineCode) {
    if (!font) {
      font = "Consolas";
    }

    if (!shading) {
      shading = {
        fill: "F5F5F5",
        type: "clear",
      };
    }
  }

  return {
    bold,
    italics,
    strike,
    underline,
    superScript,
    subScript,
    font,
    size,
    color,
    shading,
  };
}

/**
 * 从 marks 中提取链接信息。
 * Extracts link information from marks.
 *
 * @param marks - ProseMirror marks 数组 / Array of ProseMirror marks
 * @returns 包含 href 的对象或 null / Object with href or null
 */
function getLinkInfo(marks: readonly Mark[]): { href: string } | null {
  for (const mark of marks) {
    if (mark.type.name !== "link") {
      continue;
    }

    const attrs = mark.attrs as {
      href?: unknown;
    };

    if (typeof attrs.href === "string" && attrs.href.trim()) {
      return {
        href: attrs.href,
      };
    }
  }

  return null;
}

/**
 * 转换 ProseMirror 文本节点为 TextRun 或 ExternalHyperlink。
 * Converts a ProseMirror text node to TextRun or ExternalHyperlink.
 *
 * @param node - ProseMirror 文本节点 / ProseMirror text node
 * @returns TextRun 或 ExternalHyperlink 数组 / Array of TextRun or ExternalHyperlink
 */
function convertTextNode(
  node: ProseMirrorNode,
): (TextRun | ExternalHyperlink)[] {
  const text = node.text ?? "";

  if (!text) {
    return [];
  }

  const marks = node.marks;

  const options = getTextRunOptions(marks);

  const textRun = new TextRun({
    text,
    bold: options.bold,
    italics: options.italics,
    strike: options.strike,
    underline: options.underline,
    superScript: options.superScript,
    subScript: options.subScript,
    font: options.font,
    size: options.size,
    color: options.color,
    shading: options.shading,
  });

  const linkInfo = getLinkInfo(marks);

  if (!linkInfo) {
    return [textRun];
  }

  const linkTextRun = new TextRun({
    text,
    bold: options.bold,
    italics: options.italics,
    strike: options.strike,
    underline: options.underline,
    superScript: options.superScript,
    subScript: options.subScript,
    font: options.font,
    size: options.size,
    color: options.color,
    shading: options.shading,
    style: "Hyperlink",
  });

  return [
    new ExternalHyperlink({
      children: [linkTextRun],
      link: linkInfo.href,
    }),
  ];
}

/**
 * 从 Data URL 加载图片数据。
 * Loads image data from a Data URL.
 *
 * @param src - Data URL 字符串 / Data URL string
 * @returns 图片二进制数据或 null / Image binary data or null
 */
function loadDataUrl(src: string): Uint8Array | null {
  try {
    const commaIndex = src.indexOf(",");

    if (commaIndex === -1) {
      return null;
    }

    const metadata = src.slice(0, commaIndex);

    const data = src.slice(commaIndex + 1);

    if (!metadata.toLowerCase().includes(";base64")) {
      return null;
    }

    const binary = atob(data);

    const result = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      result[i] = binary.charCodeAt(i);
    }

    return result;
  } catch (error) {
    console.warn("[ExportWord] Data URL 图片解析失败:", error);

    return null;
  }
}

/**
 * 加载图片数据（支持 data:、http、https、blob）。
 * Loads image data (supports data:, http, https, blob).
 *
 * @param src - 图片地址 / Image source
 * @returns 图片二进制数据或 null / Image binary data or null
 */
async function loadImageData(src: string): Promise<Uint8Array | null> {
  if (!src) {
    return null;
  }

  if (imageCache.has(src)) {
    return imageCache.get(src) ?? null;
  }

  try {
    if (src.startsWith("data:")) {
      const data = loadDataUrl(src);

      imageCache.set(src, data);

      return data;
    }

    const response = await fetch(src, {
      mode: "cors",
    });

    if (!response.ok) {
      imageCache.set(src, null);

      return null;
    }

    const blob = await response.blob();

    const buffer = await blob.arrayBuffer();

    const data = new Uint8Array(buffer);

    imageCache.set(src, data);

    return data;
  } catch (error) {
    console.warn("[ExportWord] 图片加载失败:", src, error);

    imageCache.set(src, null);

    return null;
  }
}

/**
 * 转换行内节点（文本、图片、换行等）。
 * Converts inline nodes (text, image, break, etc.).
 *
 * @param node - ProseMirror 节点 / ProseMirror node
 * @param context - 转换上下文 / Conversion context
 * @returns TextRun / ExternalHyperlink / ImageRun 数组 / Array of TextRun, ExternalHyperlink, or ImageRun
 */
async function convertInlineNode(
  node: ProseMirrorNode,
  context: ConvertContext,
): Promise<(TextRun | ExternalHyperlink | ImageRun)[]> {
  void context;

  const results: (TextRun | ExternalHyperlink | ImageRun)[] = [];

  if (node.isText) {
    results.push(...convertTextNode(node));

    return results;
  }

  switch (node.type.name) {
    case "hardBreak":
    case "lineBreak":
      results.push(
        new TextRun({
          text: "",
          break: 1,
        }),
      );

      break;

    case "image": {
      const attrs = node.attrs as Record<string, unknown>;

      const src = typeof attrs.src === "string" ? attrs.src : "";

      if (!src) {
        break;
      }

      const imageData = await loadImageData(src);

      if (!imageData) {
        results.push(
          new TextRun({
            text: "[图片加载失败]",
          }),
        );

        break;
      }

      const size = getImageSize(attrs);

      results.push(
        new ImageRun({
          type: inferImageType(src),
          data: imageData,
          transformation: {
            width: size.width,
            height: size.height,
          },
        }),
      );

      break;
    }

    default:
      if (node.content.size > 0) {
        for (let i = 0; i < node.content.childCount; i++) {
          const child = node.content.child(i);

          results.push(...(await convertInlineNode(child, context)));
        }
      }

      break;
  }

  return results;
}

/**
 * 转换 block 节点中的所有行内内容。
 * Converts all inline content inside a block node.
 *
 * @param node - ProseMirror block 节点 / ProseMirror block node
 * @param context - 转换上下文 / Conversion context
 * @returns 行内元素数组 / Array of inline elements
 */
async function convertInlineContent(
  node: ProseMirrorNode,
  context: ConvertContext,
): Promise<(TextRun | ExternalHyperlink | ImageRun)[]> {
  const results: (TextRun | ExternalHyperlink | ImageRun)[] = [];

  if (node.content.size === 0) {
    return results;
  }

  for (let i = 0; i < node.content.childCount; i++) {
    const child = node.content.child(i);

    results.push(...(await convertInlineNode(child, context)));
  }

  return results;
}

/**
 * 转换普通段落。
 * Converts a normal paragraph.
 *
 * @param node - Paragraph 节点 / Paragraph node
 * @param context - 转换上下文 / Conversion context
 * @returns DOCX Paragraph
 */
async function convertParagraph(
  node: ProseMirrorNode,
  context: ConvertContext,
): Promise<Paragraph> {
  const attrs = node.attrs as Record<string, unknown>;

  const alignment = getDocxAlignment(attrs.textAlign ?? attrs.alignment);

  const children = await convertInlineContent(node, context);

  return new Paragraph({
    ...(alignment
      ? {
          alignment,
        }
      : {}),
    spacing: {
      after: context.listType === null ? 120 : 60,
    },
    numbering:
      context.listType !== null
        ? {
            reference:
              context.listType === "bullet" ? "bullet-list" : "ordered-list",
            level: Math.min(context.listLevel, 2),
          }
        : undefined,
    children:
      children.length > 0
        ? children
        : [
            new TextRun({
              text: "",
            }),
          ],
  });
}

/**
 * 转换标题。
 * Converts a heading.
 *
 * @param node - Heading 节点 / Heading node
 * @returns DOCX Paragraph
 */
async function convertHeading(node: ProseMirrorNode): Promise<Paragraph> {
  const attrs = node.attrs as Record<string, unknown>;

  const level = typeof attrs.level === "number" ? attrs.level : 1;

  const heading = headingLevelMap[level] ?? HeadingLevel.HEADING_1;

  const alignment = getDocxAlignment(attrs.textAlign ?? attrs.alignment);

  const children = await convertInlineContent(node, createContext());

  return new Paragraph({
    heading,
    ...(alignment
      ? {
          alignment,
        }
      : {}),
    spacing: {
      before: 240,
      after: 120,
    },
    children:
      children.length > 0
        ? children
        : [
            new TextRun({
              text: "",
            }),
          ],
  });
}

/**
 * 转换引用块（使用左边框模拟）。
 * Converts a blockquote (simulated with left border).
 *
 * @param node - blockquote 节点 / blockquote node
 * @returns DOCX Paragraph 数组 / Array of Paragraphs
 */
async function convertBlockquote(node: ProseMirrorNode): Promise<Paragraph[]> {
  const results: Paragraph[] = [];

  for (let i = 0; i < node.content.childCount; i++) {
    const child = node.content.child(i);

    if (child.type.name === "paragraph") {
      const attrs = child.attrs as Record<string, unknown>;

      const alignment = getDocxAlignment(attrs.textAlign ?? attrs.alignment);

      const children = await convertInlineContent(child, createContext());

      results.push(
        new Paragraph({
          ...(alignment
            ? {
                alignment,
              }
            : {}),
          spacing: {
            before: 60,
            after: 60,
          },
          border: {
            left: {
              color: "A6A6A6",
              space: 8,
              style: "single",
              size: 12,
            },
          },
          children:
            children.length > 0
              ? children
              : [
                  new TextRun({
                    text: "",
                  }),
                ],
        }),
      );
    } else {
      const converted = await convertBlockNode(child, createContext());

      results.push(
        ...converted.filter(
          (item): item is Paragraph => item instanceof Paragraph,
        ),
      );
    }
  }

  if (results.length === 0) {
    results.push(
      new Paragraph({
        border: {
          left: {
            color: "A6A6A6",
            space: 8,
            style: "single",
            size: 12,
          },
        },
        children: [
          new TextRun({
            text: "",
          }),
        ],
      }),
    );
  }

  return results;
}

/**
 * 转换代码块（保留换行，使用 Consolas 字体和浅灰背景）。
 * Converts a code block (preserves line breaks, uses Consolas font and light gray background).
 *
 * @param node - codeBlock 节点 / codeBlock node
 * @returns DOCX Paragraph 数组 / Array of Paragraphs
 */
async function convertCodeBlock(node: ProseMirrorNode): Promise<Paragraph[]> {
  const text = node.textContent ?? "";

  const lines = text.split("\n");

  const runs: TextRun[] = [];

  lines.forEach((line, index) => {
    if (index > 0) {
      runs.push(
        new TextRun({
          text: "",
          break: 1,
        }),
      );
    }

    runs.push(
      new TextRun({
        text: line,
        font: "Consolas",
        size: 20,
      }),
    );
  });

  return [
    new Paragraph({
      spacing: {
        before: 120,
        after: 120,
      },
      shading: {
        fill: "F5F5F5",
        type: "clear",
      },
      children:
        runs.length > 0
          ? runs
          : [
              new TextRun({
                text: "",
                font: "Consolas",
                size: 20,
              }),
            ],
    }),
  ];
}

/**
 * 获取列表类型（无序或有序）。
 * Gets list type (bullet or ordered).
 *
 * @param node - 列表节点 / List node
 * @returns "bullet" 或 "ordered" / "bullet" or "ordered"
 */
function getListType(node: ProseMirrorNode): "bullet" | "ordered" {
  return node.type.name === "orderedList" ? "ordered" : "bullet";
}

/**
 * 判断节点是否为任务列表项。
 * Checks if node is a task list item.
 *
 * @param node - ProseMirror 节点 / ProseMirror node
 * @returns 是否为任务项 / Whether it is a task item
 */
function isTaskItem(node: ProseMirrorNode): boolean {
  return node.type.name === "taskItem" || node.type.name === "taskListItem";
}

/**
 * 获取任务项的完成状态。
 * Gets the checked/done state of a task item.
 *
 * @param node - 任务项节点 / Task item node
 * @returns 是否已完成 / Whether it is checked
 */
function isTaskChecked(node: ProseMirrorNode): boolean {
  const attrs = node.attrs as Record<string, unknown>;

  return attrs.checked === true || attrs.done === true;
}

/**
 * 转换任务列表（使用 ☑ 和 ☐ 符号）。
 * Converts a task list (using ☑ and ☐ symbols).
 *
 * @param node - taskList 节点 / taskList node
 * @param context - 转换上下文 / Conversion context
 * @returns DOCX Paragraph 数组 / Array of Paragraphs
 */
async function convertTaskList(
  node: ProseMirrorNode,
  context: ConvertContext,
): Promise<Paragraph[]> {
  const results: Paragraph[] = [];

  for (let i = 0; i < node.content.childCount; i++) {
    const item = node.content.child(i);

    if (!isTaskItem(item)) {
      continue;
    }

    const checked = isTaskChecked(item);

    const itemContext = createContext({
      listLevel: context.listLevel,
      listType: null,
    });

    for (let j = 0; j < item.content.childCount; j++) {
      const child = item.content.child(j);

      if (child.type.name === "paragraph") {
        const content = await convertInlineContent(child, itemContext);

        const prefix = checked ? "☑ " : "☐ ";

        results.push(
          new Paragraph({
            spacing: {
              after: 60,
            },
            children: [
              new TextRun({
                text: prefix,
              }),
              ...content,
            ],
          }),
        );
      } else {
        const nested = await convertBlockNode(
          child,
          createContext({
            listLevel: context.listLevel + 1,
            listType: null,
          }),
        );

        results.push(
          ...nested.filter(
            (element): element is Paragraph => element instanceof Paragraph,
          ),
        );
      }
    }
  }

  return results;
}

/**
 * 转换普通列表（有序或无序）。
 * Converts a normal list (ordered or bullet).
 *
 * @param node - bulletList 或 orderedList 节点 / bulletList or orderedList node
 * @param context - 转换上下文 / Conversion context
 * @returns DOCX Paragraph 数组 / Array of Paragraphs
 */
async function convertList(
  node: ProseMirrorNode,
  context: ConvertContext,
): Promise<Paragraph[]> {
  const results: Paragraph[] = [];

  const listType = getListType(node);

  for (let i = 0; i < node.content.childCount; i++) {
    const item = node.content.child(i);

    if (item.type.name !== "listItem") {
      continue;
    }

    const itemContext = createContext({
      listLevel: context.listLevel,
      listType,
    });

    for (let j = 0; j < item.content.childCount; j++) {
      const child = item.content.child(j);

      if (child.type.name === "paragraph") {
        results.push(await convertParagraph(child, itemContext));
      } else if (
        child.type.name === "bulletList" ||
        child.type.name === "orderedList"
      ) {
        const nested = await convertList(
          child,
          createContext({
            listLevel: context.listLevel + 1,
            listType: getListType(child),
          }),
        );

        results.push(...nested);
      } else {
        const nested = await convertBlockNode(
          child,
          createContext({
            listLevel: context.listLevel + 1,
            listType,
          }),
        );

        results.push(
          ...nested.filter(
            (element): element is Paragraph => element instanceof Paragraph,
          ),
        );
      }
    }
  }

  return results;
}

/**
 * 转换表格单元格内容。
 * Converts table cell content.
 *
 * @param cell - 表格单元格节点 / Table cell node
 * @returns Paragraph 或 Table 数组 / Array of Paragraph or Table
 */
async function convertTableCellContent(
  cell: ProseMirrorNode,
): Promise<(Paragraph | Table)[]> {
  const children: (Paragraph | Table)[] = [];

  for (let i = 0; i < cell.content.childCount; i++) {
    const child = cell.content.child(i);

    const converted = await convertBlockNode(child, createContext());

    children.push(...converted);
  }

  if (children.length === 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "",
          }),
        ],
      }),
    );
  }

  return children;
}

/**
 * 转换表格。
 * Converts a table.
 *
 * @param node - table 节点 / table node
 * @returns Table 和 Paragraph 数组 / Array of Table and Paragraph
 */
async function convertTable(
  node: ProseMirrorNode,
): Promise<(Table | Paragraph)[]> {
  const rows: TableRow[] = [];

  for (let i = 0; i < node.content.childCount; i++) {
    const row = node.content.child(i);

    if (row.type.name !== "tableRow") {
      continue;
    }

    const cells: TableCell[] = [];

    for (let j = 0; j < row.content.childCount; j++) {
      const cell = row.content.child(j);

      if (cell.type.name !== "tableCell" && cell.type.name !== "tableHeader") {
        continue;
      }

      const cellAttrs = cell.attrs as Record<string, unknown>;

      const isHeader = cell.type.name === "tableHeader";

      const cellChildren = await convertTableCellContent(cell);

      const tableCell = new TableCell({
        children: cellChildren,
        ...(isHeader
          ? {
              shading: {
                fill: "F2F2F2",
                type: "clear",
              },
            }
          : {}),
        ...(typeof cellAttrs.colspan === "number" && cellAttrs.colspan > 1
          ? {
              columnSpan: cellAttrs.colspan,
            }
          : {}),
        ...(typeof cellAttrs.rowspan === "number" && cellAttrs.rowspan > 1
          ? {
              rowSpan: cellAttrs.rowspan,
            }
          : {}),
      });

      cells.push(tableCell);
    }

    if (cells.length > 0) {
      rows.push(
        new TableRow({
          children: cells,
        }),
      );
    }
  }

  if (rows.length === 0) {
    return [];
  }

  return [
    new Table({
      rows,
    }),
    new Paragraph({
      spacing: {
        after: 120,
      },
      children: [
        new TextRun({
          text: "",
        }),
      ],
    }),
  ];
}

/**
 * 转换块级节点（paragraph, heading, blockquote, codeBlock, list, taskList, divider, table 等）。
 * Converts block-level nodes (paragraph, heading, blockquote, codeBlock, list, taskList, divider, table, etc.).
 *
 * @param node - ProseMirror 节点 / ProseMirror node
 * @param context - 转换上下文 / Conversion context
 * @returns Paragraph 或 Table 数组 / Array of Paragraph or Table
 */
async function convertBlockNode(
  node: ProseMirrorNode,
  context: ConvertContext,
): Promise<(Paragraph | Table)[]> {
  switch (node.type.name) {
    case "paragraph":
      return [await convertParagraph(node, context)];

    case "heading":
      return [await convertHeading(node)];

    case "blockquote":
      return await convertBlockquote(node);

    case "codeBlock":
      return await convertCodeBlock(node);

    case "bulletList":
      return await convertList(
        node,
        createContext({
          listLevel: context.listLevel,
          listType: "bullet",
        }),
      );

    case "orderedList":
      return await convertList(
        node,
        createContext({
          listLevel: context.listLevel,
          listType: "ordered",
        }),
      );

    case "taskList":
      return await convertTaskList(
        node,
        createContext({
          listLevel: context.listLevel,
          listType: null,
        }),
      );

    case "divider":
      return [
        new Paragraph({
          spacing: {
            before: 120,
            after: 120,
          },
          border: {
            bottom: {
              color: "A6A6A6",
              space: 1,
              style: "single",
              size: 6,
            },
          },
          children: [
            new TextRun({
              text: "",
            }),
          ],
        }),
      ];

    case "table":
      return await convertTable(node);

    case "listItem": {
      const parentContext = createContext({
        listLevel: context.listLevel,
        listType: context.listType ?? "bullet",
      });

      const result: Paragraph[] = [];

      for (let i = 0; i < node.content.childCount; i++) {
        const child = node.content.child(i);

        if (child.type.name === "paragraph") {
          result.push(await convertParagraph(child, parentContext));
        } else {
          const nested = await convertBlockNode(
            child,
            createContext({
              listLevel: context.listLevel + 1,
              listType: context.listType,
            }),
          );

          result.push(
            ...nested.filter(
              (element): element is Paragraph => element instanceof Paragraph,
            ),
          );
        }
      }

      return result;
    }

    case "taskItem": {
      const checked = isTaskChecked(node);

      const result: Paragraph[] = [];

      for (let i = 0; i < node.content.childCount; i++) {
        const child = node.content.child(i);

        if (child.type.name === "paragraph") {
          const content = await convertInlineContent(child, createContext());

          result.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: checked ? "☑ " : "☐ ",
                }),
                ...content,
              ],
            }),
          );
        }
      }

      return result;
    }

    default: {
      const results: (Paragraph | Table)[] = [];

      if (node.content.size > 0) {
        for (let i = 0; i < node.content.childCount; i++) {
          const child = node.content.child(i);

          const converted = await convertBlockNode(child, context);

          results.push(...converted);
        }
      }

      if (results.length === 0 && node.textContent) {
        const children = await convertInlineContent(node, context);

        if (children.length > 0) {
          results.push(
            new Paragraph({
              children,
            }),
          );
        }
      }

      return results;
    }
  }
}

/**
 * 将 ProseMirror Document 转换为 DOCX Document。
 * Converts a ProseMirror Document to a DOCX Document.
 *
 * @param doc - ProseMirror Document 根节点 / ProseMirror Document root node
 * @returns DOCX Document 对象 / DOCX Document object
 */
async function convertDocument(doc: ProseMirrorNode): Promise<Document> {
  const children: (Paragraph | Table)[] = [];

  const context = createContext();

  for (let i = 0; i < doc.content.childCount; i++) {
    const node = doc.content.child(i);

    const converted = await convertBlockNode(node, context);

    children.push(...converted);
  }

  if (children.length === 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "",
          }),
        ],
      }),
    );
  }

  return new Document({
    numbering: {
      config: numberingConfig,
    },

    styles: {
      default: {
        document: {
          run: {
            size: 24,
            font: "等线",
          },
        },
      },
    },

    sections: [
      {
        children,
      },
    ],
  });
}

/**
 * 导出 ProseMirror Document 为 DOCX 文件。
 * Exports a ProseMirror Document as a DOCX file.
 *
 * @param doc - ProseMirror Document 根节点 / ProseMirror Document root node
 * @param fileName - 导出文件名 / Export file name
 */
async function exportDocx(
  doc: ProseMirrorNode,
  fileName: string,
): Promise<void> {
  imageCache.clear();

  const document = await convertDocument(doc);

  const blob = await Packer.toBlob(document);

  downloadFile(blob, fileName);
}

/**
 * ExportWord 扩展的选项。
 * Options for the ExportWord extension.
 */
export interface ExportWordOptions {
  /** 导出的默认文件名 / Default file name for export */
  fileName?: string;
}

/**
 * Tiptap ExportWord 扩展。
 *
 * 提供 `exportWord` 命令，将当前编辑器内容导出为 Word (.docx) 文件。
 *
 * Tiptap ExportWord extension.
 *
 * Provides the `exportWord` command to export the current editor content as a Word (.docx) file.
 */
export const ExportWord = Extension.create<ExportWordOptions>({
  name: "exportWord",

  addOptions() {
    return {
      fileName: "freeEditor.docx",
    };
  },

  addCommands() {
    return {
      exportWord:
        () =>
        ({ editor }: { editor: Editor }) => {
          const doc = editor.state.doc;

          const fileName = this.options.fileName ?? "freeEditor.docx";

          exportDocx(doc, fileName).catch((error) => {
            console.error("[ExportWord] 导出失败:", error);
          });

          return true;
        },
    };
  },
});

/**
 * Tiptap Commands 类型扩展（添加 exportWord 命令）。
 * Tiptap Commands type extension (adds exportWord command).
 */
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    exportWord: {
      /** 导出当前编辑器内容为 Word 文档 / Export current editor content as Word document */
      exportWord: () => ReturnType;
    };
  }
}
