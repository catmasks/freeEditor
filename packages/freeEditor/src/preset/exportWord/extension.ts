import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { Mark } from "@tiptap/pm/model";

import { downloadFile } from "../../core/index";

/**
 * DOCX 类型仅用于 TypeScript 类型检查。
 * 使用 import type 不会在运行时加载 docx。
 * DOCX types are only used for TypeScript type checking.
 * Using import type does not load docx at runtime.
 */
import type {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  UnderlineType,
  ImageRun,
  ExternalHyperlink,
} from "docx";

/**
 * DOCX 运行时模块类型。
 */
import type * as DocxModule from "docx";

type DocxRuntime = typeof DocxModule;

/**
 * 编号配置（用于列表）。
 * Numbering configuration for lists.
 */
function createNumberingConfig(runtime: DocxRuntime): any {
  return [
    {
      reference: "bullet-list",
      levels: [
        {
          level: 0,
          format: runtime.LevelFormat.BULLET,
          text: "\u2022",
          alignment: runtime.AlignmentType.LEFT,
        },
        {
          level: 1,
          format: runtime.LevelFormat.BULLET,
          text: "\u25CB",
          alignment: runtime.AlignmentType.LEFT,
        },
        {
          level: 2,
          format: runtime.LevelFormat.BULLET,
          text: "\u25A0",
          alignment: runtime.AlignmentType.LEFT,
        },
      ],
    },
    {
      reference: "ordered-list",
      levels: [
        {
          level: 0,
          format: runtime.LevelFormat.DECIMAL,
          text: "%1.",
          alignment: runtime.AlignmentType.LEFT,
        },
        {
          level: 1,
          format: runtime.LevelFormat.LOWER_LETTER,
          text: "%1.",
          alignment: runtime.AlignmentType.LEFT,
        },
        {
          level: 2,
          format: runtime.LevelFormat.LOWER_ROMAN,
          text: "%1.",
          alignment: runtime.AlignmentType.LEFT,
        },
      ],
    },
  ] as const;
}

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
function getHeadingLevelMap(
  runtime: DocxRuntime,
): Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> {
  return {
    1: runtime.HeadingLevel.HEADING_1,
    2: runtime.HeadingLevel.HEADING_2,
    3: runtime.HeadingLevel.HEADING_3,
    4: runtime.HeadingLevel.HEADING_4,
    5: runtime.HeadingLevel.HEADING_5,
    6: runtime.HeadingLevel.HEADING_6,
  };
}

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
 * 将 CSS 单位值转换为像素值。
 * Converts a CSS unit value to pixels.
 */
function convertUnitToPx(number: number, unit: string): number {
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

  return convertUnitToPx(number, unit);
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
 * Converts CSS color to DOCX-compatible 6-digit HEX (supports #rgb, #rrggbb, rgb(), rgba()).
 *
 * @param color - CSS 颜色值 / CSS color value
 * @returns 6 位 HEX 字符串或 undefined / 6-digit HEX string or undefined
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
 * 将 CSS 字体大小转换为 DOCX half-point 单位（12pt = 24 half-points）。
 * Converts CSS font size to DOCX half-point units (12pt = 24 half-points).
 *
 * @param value - CSS 字体大小值 / CSS font size value
 * @returns half-point 值或 undefined / half-point value or undefined
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
  runtime: DocxRuntime,
): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
  if (typeof alignment !== "string") {
    return undefined;
  }

  switch (alignment) {
    case "left":
      return runtime.AlignmentType.LEFT;

    case "center":
      return runtime.AlignmentType.CENTER;

    case "right":
      return runtime.AlignmentType.RIGHT;

    case "justify":
      return runtime.AlignmentType.JUSTIFIED;

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
 * 从 mark attrs 中提取字体样式属性（fontSize, fontFamily, color, backgroundColor）。
 * Extracts font style properties from mark attrs.
 */
function applyTextStyleAttrs(
  mark: Mark,
  state: {
    size: number | undefined;
    font: string | undefined;
    color: string | undefined;
    shading: { fill: string; type: "clear" } | undefined;
  },
): void {
  const attrs = mark.attrs as {
    fontSize?: unknown;
    fontFamily?: unknown;
    color?: unknown;
    backgroundColor?: unknown;
  };

  if (attrs.fontSize) {
    const parsedSize = parseFontSizeToHalfPoint(attrs.fontSize);

    if (parsedSize !== undefined) {
      state.size = parsedSize;
    }
  }

  if (typeof attrs.fontFamily === "string" && attrs.fontFamily.trim()) {
    state.font = attrs.fontFamily.trim();
  }

  const normalizedColor = normalizeColor(attrs.color);

  if (normalizedColor) {
    state.color = normalizedColor;
  }

  const normalizedBackground = normalizeColor(attrs.backgroundColor);

  if (normalizedBackground) {
    state.shading = {
      fill: normalizedBackground,
      type: "clear",
    };
  }
}

/**
 * 为内联代码应用默认样式（Consolas 字体 + 浅灰背景）。
 * Applies default styles for inline code (Consolas font + light gray background).
 */
function applyInlineCodeDefaults(
  isInlineCode: boolean,
  state: {
    font: string | undefined;
    shading: { fill: string; type: "clear" } | undefined;
  },
): void {
  if (!isInlineCode) {
    return;
  }

  if (!state.font) {
    state.font = "Consolas";
  }

  if (!state.shading) {
    state.shading = {
      fill: "F5F5F5",
      type: "clear",
    };
  }
}

/**
 * 处理单个 mark 的样式，更新状态对象。
 * Processes a single mark's style, updating the state object.
 */
function handleMark(
  mark: Mark,
  runtime: DocxRuntime,
  state: {
    bold: boolean | undefined;
    italics: boolean | undefined;
    strike: boolean | undefined;
    underline:
      | {
          type: (typeof UnderlineType)[keyof typeof UnderlineType];
        }
      | undefined;
    superScript: boolean | undefined;
    subScript: boolean | undefined;
    styleState: {
      size: number | undefined;
      font: string | undefined;
      color: string | undefined;
      shading: { fill: string; type: "clear" } | undefined;
    };
  },
): void {
  switch (mark.type.name) {
    case "bold":
      state.bold = true;
      break;

    case "italic":
      state.italics = true;
      break;

    case "underline":
      state.underline = {
        type: runtime.UnderlineType.SINGLE,
      };
      break;

    case "strike":
      state.strike = true;
      break;

    case "superscript":
      state.superScript = true;
      break;

    case "subscript":
      state.subScript = true;
      break;

    case "textStyle":
    case "style":
      applyTextStyleAttrs(mark, state.styleState);
      break;

    default:
      break;
  }
}

/**
 * 从 ProseMirror marks 提取 TextRun 样式选项。
 * Extracts TextRun style options from ProseMirror marks.
 *
 * @param marks - ProseMirror marks 数组 / Array of ProseMirror marks
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns TextRun 样式选项 / TextRun style options
 */
function getTextRunOptions(
  marks: readonly Mark[],
  runtime: DocxRuntime,
): TextRunOptions {
  const state = {
    bold: undefined as boolean | undefined,
    italics: undefined as boolean | undefined,
    strike: undefined as boolean | undefined,
    underline: undefined as
      | {
          type: (typeof UnderlineType)[keyof typeof UnderlineType];
        }
      | undefined,
    superScript: undefined as boolean | undefined,
    subScript: undefined as boolean | undefined,
    isInlineCode: false,
    styleState: {
      size: undefined as number | undefined,
      font: undefined as string | undefined,
      color: undefined as string | undefined,
      shading: undefined as { fill: string; type: "clear" } | undefined,
    },
  };

  for (const mark of marks) {
    if (mark.type.name === "code" || mark.type.name === "inlineCode") {
      state.isInlineCode = true;
    }

    handleMark(mark, runtime, state);
  }

  applyInlineCodeDefaults(state.isInlineCode, state.styleState);

  return {
    bold: state.bold,
    italics: state.italics,
    strike: state.strike,
    underline: state.underline,
    superScript: state.superScript,
    subScript: state.subScript,
    font: state.styleState.font,
    size: state.styleState.size,
    color: state.styleState.color,
    shading: state.styleState.shading,
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
 * Converts a ProseMirror text node to a TextRun or ExternalHyperlink.
 *
 * @param node - ProseMirror 文本节点 / ProseMirror text node
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns TextRun 或 ExternalHyperlink 数组 / Array of TextRun or ExternalHyperlink
 */
function convertTextNode(
  node: ProseMirrorNode,
  runtime: DocxRuntime,
): (TextRun | ExternalHyperlink)[] {
  const text = node.text ?? "";

  if (!text) {
    return [];
  }

  const marks = node.marks;

  const options = getTextRunOptions(marks, runtime);

  const textRun = new runtime.TextRun({
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

  const linkTextRun = new runtime.TextRun({
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
    new runtime.ExternalHyperlink({
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
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns TextRun / ExternalHyperlink / ImageRun 数组 / Array of TextRun, ExternalHyperlink, or ImageRun
 */
async function convertInlineNode(
  node: ProseMirrorNode,
  context: ConvertContext,
  runtime: DocxRuntime,
): Promise<(TextRun | ExternalHyperlink | ImageRun)[]> {
  void context;

  const results: (TextRun | ExternalHyperlink | ImageRun)[] = [];

  if (node.isText) {
    results.push(...convertTextNode(node, runtime));

    return results;
  }

  switch (node.type.name) {
    case "hardBreak":
    case "lineBreak":
      results.push(
        new runtime.TextRun({
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
          new runtime.TextRun({
            text: "[图片加载失败]",
          }),
        );

        break;
      }

      const size = getImageSize(attrs);

      results.push(
        new runtime.ImageRun({
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

          results.push(...(await convertInlineNode(child, context, runtime)));
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
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns 行内元素数组 / Array of inline elements
 */
async function convertInlineContent(
  node: ProseMirrorNode,
  context: ConvertContext,
  runtime: DocxRuntime,
): Promise<(TextRun | ExternalHyperlink | ImageRun)[]> {
  const results: (TextRun | ExternalHyperlink | ImageRun)[] = [];

  if (node.content.size === 0) {
    return results;
  }

  for (let i = 0; i < node.content.childCount; i++) {
    const child = node.content.child(i);

    results.push(...(await convertInlineNode(child, context, runtime)));
  }

  return results;
}

/**
 * 转换普通段落。
 * Converts a normal paragraph.
 *
 * @param node - Paragraph 节点 / Paragraph node
 * @param context - 转换上下文 / Conversion context
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns DOCX Paragraph
 */
async function convertParagraph(
  node: ProseMirrorNode,
  context: ConvertContext,
  runtime: DocxRuntime,
): Promise<Paragraph> {
  const attrs = node.attrs as Record<string, unknown>;

  const alignment = getDocxAlignment(
    attrs.textAlign ?? attrs.alignment,
    runtime,
  );

  const children = await convertInlineContent(node, context, runtime);

  return new runtime.Paragraph({
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
            new runtime.TextRun({
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
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns DOCX Paragraph
 */
async function convertHeading(
  node: ProseMirrorNode,
  runtime: DocxRuntime,
): Promise<Paragraph> {
  const attrs = node.attrs as Record<string, unknown>;

  const level = typeof attrs.level === "number" ? attrs.level : 1;

  const headingMap = getHeadingLevelMap(runtime);

  const heading = headingMap[level] ?? runtime.HeadingLevel.HEADING_1;

  const alignment = getDocxAlignment(
    attrs.textAlign ?? attrs.alignment,
    runtime,
  );

  const children = await convertInlineContent(node, createContext(), runtime);

  return new runtime.Paragraph({
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
            new runtime.TextRun({
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
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns DOCX Paragraph 数组 / Array of Paragraphs
 */
async function convertBlockquote(
  node: ProseMirrorNode,
  runtime: DocxRuntime,
): Promise<Paragraph[]> {
  const results: Paragraph[] = [];

  for (let i = 0; i < node.content.childCount; i++) {
    const child = node.content.child(i);

    if (child.type.name === "paragraph") {
      const attrs = child.attrs as Record<string, unknown>;

      const alignment = getDocxAlignment(
        attrs.textAlign ?? attrs.alignment,
        runtime,
      );

      const children = await convertInlineContent(
        child,
        createContext(),
        runtime,
      );

      results.push(
        new runtime.Paragraph({
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
                  new runtime.TextRun({
                    text: "",
                  }),
                ],
        }),
      );
    } else {
      const converted = await convertBlockNode(child, createContext(), runtime);

      results.push(
        ...converted.filter(
          (item): item is Paragraph => item instanceof runtime.Paragraph,
        ),
      );
    }
  }

  if (results.length === 0) {
    results.push(
      new runtime.Paragraph({
        border: {
          left: {
            color: "A6A6A6",
            space: 8,
            style: "single",
            size: 12,
          },
        },
        children: [
          new runtime.TextRun({
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
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns DOCX Paragraph 数组 / Array of Paragraphs
 */
async function convertCodeBlock(
  node: ProseMirrorNode,
  runtime: DocxRuntime,
): Promise<Paragraph[]> {
  const text = node.textContent ?? "";

  const lines = text.split("\n");

  const runs: TextRun[] = [];

  lines.forEach((line, index) => {
    if (index > 0) {
      runs.push(
        new runtime.TextRun({
          text: "",
          break: 1,
        }),
      );
    }

    runs.push(
      new runtime.TextRun({
        text: line,
        font: "Consolas",
        size: 20,
      }),
    );
  });

  return [
    new runtime.Paragraph({
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
              new runtime.TextRun({
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
 * Checks if node is a task item.
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
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns DOCX Paragraph 数组 / Array of Paragraphs
 */
async function convertTaskList(
  node: ProseMirrorNode,
  context: ConvertContext,
  runtime: DocxRuntime,
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
        const content = await convertInlineContent(child, itemContext, runtime);

        const prefix = checked ? "☑ " : "☐ ";

        results.push(
          new runtime.Paragraph({
            spacing: {
              after: 60,
            },
            children: [
              new runtime.TextRun({
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
          runtime,
        );

        results.push(
          ...nested.filter(
            (element): element is Paragraph =>
              element instanceof runtime.Paragraph,
          ),
        );
      }
    }
  }

  return results;
}

/**
 * 转换普通列表（有序或无序）。
 * Converts a normal list (ordered or unordered).
 *
 * @param node - bulletList 或 orderedList 节点 / bulletList or orderedList node
 * @param context - 转换上下文 / Conversion context
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns DOCX Paragraph 数组 / Array of Paragraphs
 */
async function convertList(
  node: ProseMirrorNode,
  context: ConvertContext,
  runtime: DocxRuntime,
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
        results.push(await convertParagraph(child, itemContext, runtime));
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
          runtime,
        );

        results.push(...nested);
      } else {
        const nested = await convertBlockNode(
          child,
          createContext({
            listLevel: context.listLevel + 1,
            listType,
          }),
          runtime,
        );

        results.push(
          ...nested.filter(
            (element): element is Paragraph =>
              element instanceof runtime.Paragraph,
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
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns Paragraph 或 Table 数组 / Array of Paragraph or Table
 */
async function convertTableCellContent(
  cell: ProseMirrorNode,
  runtime: DocxRuntime,
): Promise<(Paragraph | Table)[]> {
  const children: (Paragraph | Table)[] = [];

  for (let i = 0; i < cell.content.childCount; i++) {
    const child = cell.content.child(i);

    const converted = await convertBlockNode(child, createContext(), runtime);

    children.push(...converted);
  }

  if (children.length === 0) {
    children.push(
      new runtime.Paragraph({
        children: [
          new runtime.TextRun({
            text: "",
          }),
        ],
      }),
    );
  }

  return children;
}

/**
 * 转换单个表格单元格，处理表头样式、colspan 和 rowspan。
 * Converts a single table cell, handling header styling, colspan, and rowspan.
 */
async function convertCell(
  cell: ProseMirrorNode,
  runtime: DocxRuntime,
): Promise<TableCell | null> {
  if (cell.type.name !== "tableCell" && cell.type.name !== "tableHeader") {
    return null;
  }

  const cellAttrs = cell.attrs as Record<string, unknown>;

  const isHeader = cell.type.name === "tableHeader";

  const cellChildren = await convertTableCellContent(cell, runtime);

  return new runtime.TableCell({
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
}

/**
 * 转换单个表格行，收集其所有单元格。
 * Converts a single table row, collecting all its cells.
 */
async function convertRow(
  row: ProseMirrorNode,
  runtime: DocxRuntime,
): Promise<TableCell[]> {
  const cells: TableCell[] = [];

  for (let j = 0; j < row.content.childCount; j++) {
    const cell = await convertCell(row.content.child(j), runtime);

    if (cell !== null) {
      cells.push(cell);
    }
  }

  return cells;
}

/**
 * 转换表格。
 * Converts a table.
 *
 * @param node - table 节点 / table node
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns Table 和 Paragraph 数组 / Array of Table and Paragraph
 */
async function convertTable(
  node: ProseMirrorNode,
  runtime: DocxRuntime,
): Promise<(Table | Paragraph)[]> {
  const rows: TableRow[] = [];

  for (let i = 0; i < node.content.childCount; i++) {
    const row = node.content.child(i);

    if (row.type.name !== "tableRow") {
      continue;
    }

    const cells = await convertRow(row, runtime);

    if (cells.length > 0) {
      rows.push(
        new runtime.TableRow({
          children: cells,
        }),
      );
    }
  }

  if (rows.length === 0) {
    return [];
  }

  return [
    new runtime.Table({
      rows,
    }),
    new runtime.Paragraph({
      spacing: {
        after: 120,
      },
      children: [
        new runtime.TextRun({
          text: "",
        }),
      ],
    }),
  ];
}

/**
 * 转换 listItem 节点，处理段落和嵌套列表。
 * Converts a listItem node, handling paragraphs and nested lists.
 */
async function convertListItem(
  node: ProseMirrorNode,
  context: ConvertContext,
  runtime: DocxRuntime,
): Promise<Paragraph[]> {
  const parentContext = createContext({
    listLevel: context.listLevel,
    listType: context.listType ?? "bullet",
  });

  const result: Paragraph[] = [];

  for (let i = 0; i < node.content.childCount; i++) {
    const child = node.content.child(i);

    if (child.type.name === "paragraph") {
      result.push(await convertParagraph(child, parentContext, runtime));
    } else {
      const nested = await convertBlockNode(
        child,
        createContext({
          listLevel: context.listLevel + 1,
          listType: context.listType,
        }),
        runtime,
      );

      result.push(
        ...nested.filter(
          (element): element is Paragraph =>
            element instanceof runtime.Paragraph,
        ),
      );
    }
  }

  return result;
}

/**
 * 转换 taskItem 节点，添加复选框标记。
 * Converts a taskItem node, adding checkbox markers.
 */
async function convertTaskItemNode(
  node: ProseMirrorNode,
  runtime: DocxRuntime,
): Promise<Paragraph[]> {
  const checked = isTaskChecked(node);

  const result: Paragraph[] = [];

  for (let i = 0; i < node.content.childCount; i++) {
    const child = node.content.child(i);

    if (child.type.name === "paragraph") {
      const content = await convertInlineContent(
        child,
        createContext(),
        runtime,
      );

      result.push(
        new runtime.Paragraph({
          children: [
            new runtime.TextRun({
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

/**
 * 转换未知类型的块级节点，递归处理子节点或回退到内联内容。
 * Converts unknown block-level nodes, recursively processing children or falling back to inline content.
 */
async function convertDefaultBlock(
  node: ProseMirrorNode,
  context: ConvertContext,
  runtime: DocxRuntime,
): Promise<(Paragraph | Table)[]> {
  const results: (Paragraph | Table)[] = [];

  if (node.content.size > 0) {
    for (let i = 0; i < node.content.childCount; i++) {
      const child = node.content.child(i);

      const converted = await convertBlockNode(child, context, runtime);

      results.push(...converted);
    }
  }

  if (results.length === 0 && node.textContent) {
    const children = await convertInlineContent(node, context, runtime);

    if (children.length > 0) {
      results.push(
        new runtime.Paragraph({
          children,
        }),
      );
    }
  }

  return results;
}

/**
 * 创建分割线段落。
 * Creates a divider paragraph.
 */
function createDivider(runtime: DocxRuntime): Paragraph {
  return new runtime.Paragraph({
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
      new runtime.TextRun({
        text: "",
      }),
    ],
  });
}

/**
 * 转换 bulletList 或 orderedList 节点。
 * Converts a bulletList or orderedList node.
 */
async function convertListNode(
  node: ProseMirrorNode,
  context: ConvertContext,
  runtime: DocxRuntime,
  isBullet: boolean,
): Promise<(Paragraph | Table)[]> {
  return await convertList(
    node,
    createContext({
      listLevel: context.listLevel,
      listType: isBullet ? "bullet" : "ordered",
    }),
    runtime,
  );
}

/**
 * 转换 taskList 节点。
 * Converts a taskList node.
 */
async function convertTaskListWithContext(
  node: ProseMirrorNode,
  context: ConvertContext,
  runtime: DocxRuntime,
): Promise<(Paragraph | Table)[]> {
  return await convertTaskList(
    node,
    createContext({
      listLevel: context.listLevel,
      listType: null,
    }),
    runtime,
  );
}

/**
 * 转换块级节点（paragraph, heading, blockquote, codeBlock, list, taskList, divider, table 等）。
 * Converts block-level nodes (paragraph, heading, blockquote, codeBlock, list, taskList, divider, table, etc.).
 *
 * @param node - ProseMirror 节点 / ProseMirror node
 * @param context - 转换上下文 / Conversion context
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns Paragraph 或 Table 数组 / Array of Paragraph or Table
 */
type BlockHandler = (
  node: ProseMirrorNode,
  context: ConvertContext,
  runtime: DocxRuntime,
) => Promise<(Paragraph | Table)[]>;

const blockHandlers: Record<string, BlockHandler> = {
  paragraph: async (node, context, runtime) => [
    await convertParagraph(node, context, runtime),
  ],

  heading: async (node, _context, runtime) => [
    await convertHeading(node, runtime),
  ],

  blockquote: async (node, _context, runtime) =>
    await convertBlockquote(node, runtime),

  codeBlock: async (node, _context, runtime) =>
    await convertCodeBlock(node, runtime),

  bulletList: async (node, context, runtime) =>
    await convertListNode(node, context, runtime, true),

  orderedList: async (node, context, runtime) =>
    await convertListNode(node, context, runtime, false),

  taskList: async (node, context, runtime) =>
    await convertTaskListWithContext(node, context, runtime),

  divider: async (_node, _context, runtime) => [createDivider(runtime)],

  table: async (node, _context, runtime) => await convertTable(node, runtime),

  listItem: async (node, context, runtime) =>
    await convertListItem(node, context, runtime),

  taskItem: async (node, _context, runtime) =>
    await convertTaskItemNode(node, runtime),
};

async function convertBlockNode(
  node: ProseMirrorNode,
  context: ConvertContext,
  runtime: DocxRuntime,
): Promise<(Paragraph | Table)[]> {
  const handler = blockHandlers[node.type.name];

  if (handler) {
    return handler(node, context, runtime);
  }

  return await convertDefaultBlock(node, context, runtime);
}

/**
 * 将 ProseMirror Document 转换为 DOCX Document。
 * Converts a ProseMirror Document to a DOCX Document.
 *
 * @param doc - ProseMirror Document 根节点 / ProseMirror Document root node
 * @param runtime - DOCX 运行时模块 / DOCX runtime module
 * @returns DOCX Document 对象 / DOCX Document object
 */
async function convertDocument(
  doc: ProseMirrorNode,
  runtime: DocxRuntime,
): Promise<Document> {
  const children: (Paragraph | Table)[] = [];

  const context = createContext();

  for (let i = 0; i < doc.content.childCount; i++) {
    const node = doc.content.child(i);

    const converted = await convertBlockNode(node, context, runtime);

    children.push(...converted);
  }

  if (children.length === 0) {
    children.push(
      new runtime.Paragraph({
        children: [
          new runtime.TextRun({
            text: "",
          }),
        ],
      }),
    );
  }

  return new runtime.Document({
    numbering: {
      config: createNumberingConfig(runtime),
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
 * 动态加载 DOCX 运行时。
 *
 * 这里必须捕获动态 import 失败，
 * 避免 docx 未安装、模块损坏或构建产物缺失时继续执行导出流程。
 */
async function loadDocxRuntime(): Promise<DocxRuntime> {
  try {
    return await import("docx");
  } catch (error) {
    console.error("[ExportWord] DOCX 模块加载失败:", error);

    throw new Error(
      "无法加载 DOCX 导出模块，请确认 docx 依赖已正确安装并打包。",
      {
        cause: error,
      },
    );
  }
}

/**
 * 导出 ProseMirror Document 为 DOCX 文件。
 * Exports a ProseMirror Document as DOCX file.
 *
 * @param doc - ProseMirror Document 根节点 / ProseMirror Document root node
 * @param fileName - 导出文件名 / Export file name
 */
async function exportDocx(
  doc: ProseMirrorNode,
  fileName: string,
): Promise<void> {
  imageCache.clear();

  try {
    /**
     * DOCX 运行时采用动态加载，
     * 如果加载失败会立即抛出异常，不再继续执行后续转换。
     */
    const runtime = await loadDocxRuntime();

    const document = await convertDocument(doc, runtime);

    const blob = await runtime.Packer.toBlob(document);

    await downloadFile(blob, fileName);
  } catch (error) {
    console.error("[ExportWord] Word 导出失败:", error);

    throw error;
  } finally {
    imageCache.clear();
  }
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
        ({ editor }: { editor: Editor }): boolean => {
          const doc = editor.state.doc;

          const fileName = this.options.fileName ?? "freeEditor.docx";

          /**
           * 异步导出统一在这里处理异常。
           */
          void exportDocx(doc, fileName).catch((error) => {
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
