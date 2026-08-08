/**
 * ExportWord Tiptap Extension
 */

import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { getEditorHTML, downloadFile } from "../../core/utils/export";
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
  WidthType,
} from "docx";

/**
 * 支持的 HTML 元素类型
 */
type SupportedTag =
  | "p"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "strong"
  | "b"
  | "em"
  | "i"
  | "u"
  | "s"
  | "strike"
  | "del"
  | "a"
  | "ul"
  | "ol"
  | "li"
  | "blockquote"
  | "table"
  | "tr"
  | "td"
  | "th"
  | "thead"
  | "tbody"
  | "img"
  | "br"
  | "div"
  | "span";

/**
 * 编号配置
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
    ],
  },
] as const;

/**
 * 解析样式字符串为对象
 */
function parseInlineStyle(style: string): Record<string, string> {
  const styles: Record<string, string> = {};
  style.split(";").forEach((s) => {
    const [key, ...rest] = s.trim().split(":");
    if (key && rest.length) {
      styles[key.trim()] = rest.join(":").trim();
    }
  });
  return styles;
}

/**
 * 获取对齐方式
 */
function getAlignment(
  tagName: string,
  style?: Record<string, string>,
): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void tagName;
  const textAlign = style?.["text-align"];
  if (textAlign === "center") return AlignmentType.CENTER;
  if (textAlign === "right") return AlignmentType.RIGHT;
  if (textAlign === "left") return AlignmentType.LEFT;
  if (textAlign === "justify") return AlignmentType.JUSTIFIED;
  return undefined;
}

/**
 * 将 HTML 节点转换为 TextRun 数组
 */
function convertTextRuns(
  node: ChildNode,
  style?: Record<string, string>,
): TextRun[] {
  const runs: TextRun[] = [];

  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    if (text.trim()) {
      runs.push(
        new TextRun({
          text,
          bold: style?.["font-weight"] === "bold",
          italics: style?.["font-style"] === "italic",
          underline: style?.["text-decoration"]?.includes("underline")
            ? { type: UnderlineType.SINGLE }
            : undefined,
          strike: style?.["text-decoration"]?.includes("line-through"),
        }),
      );
    }
    return runs;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return runs;

  const el = node as HTMLElement;
  const tagName = el.tagName.toLowerCase() as SupportedTag;
  const elStyle = parseInlineStyle(el.style.cssText || "");
  const mergedStyle = { ...style, ...elStyle };

  switch (tagName) {
    case "strong":
    case "b":
      el.childNodes.forEach((child) => {
        runs.push(
          ...convertTextRuns(child, { ...mergedStyle, "font-weight": "bold" }),
        );
      });
      break;

    case "em":
    case "i":
      el.childNodes.forEach((child) => {
        runs.push(
          ...convertTextRuns(child, { ...mergedStyle, "font-style": "italic" }),
        );
      });
      break;

    case "u":
      el.childNodes.forEach((child) => {
        const currentDeco = mergedStyle["text-decoration"] || "";
        runs.push(
          ...convertTextRuns(child, {
            ...mergedStyle,
            "text-decoration": `${currentDeco} underline`,
          }),
        );
      });
      break;

    case "s":
    case "strike":
    case "del":
      el.childNodes.forEach((child) => {
        const currentDeco = mergedStyle["text-decoration"] || "";
        runs.push(
          ...convertTextRuns(child, {
            ...mergedStyle,
            "text-decoration": `${currentDeco} line-through`,
          }),
        );
      });
      break;

    case "span":
      el.childNodes.forEach((child) => {
        runs.push(...convertTextRuns(child, mergedStyle));
      });
      break;

    case "a": {
      const href = el.getAttribute("href") || "";
      const linkText = el.textContent || "";
      if (linkText.trim()) {
        runs.push(
          new TextRun({
            text: linkText,
            style: "Hyperlink",
          }),
        );
      }
      break;
    }

    case "br":
      runs.push(new TextRun({ text: "\n", break: 1 }));
      break;

    default:
      el.childNodes.forEach((child) => {
        runs.push(...convertTextRuns(child, mergedStyle));
      });
      break;
  }

  return runs;
}

/**
 * 将 HTML 节点转换为段落或表格
 */
function convertBlockNode(node: ChildNode): (Paragraph | Table)[] {
  const results: (Paragraph | Table)[] = [];

  if (node.nodeType !== Node.ELEMENT_NODE) {
    const text = node.textContent?.trim();
    if (text) {
      results.push(
        new Paragraph({
          children: [new TextRun({ text })],
        }),
      );
    }
    return results;
  }

  const el = node as HTMLElement;
  const tagName = el.tagName.toLowerCase() as SupportedTag;
  const style = parseInlineStyle(el.style.cssText || "");
  const alignment = getAlignment(tagName, style);

  switch (tagName) {
    case "p":
    case "div": {
      const children = convertChildrenToRuns(el.childNodes);
      if (children.length > 0) {
        results.push(
          new Paragraph({
            alignment,
            spacing: { after: 120 },
            children,
          }),
        );
      }
      break;
    }

    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6": {
      const levelMap: Record<string, number> = {
        h1: 1,
        h2: 2,
        h3: 3,
        h4: 4,
        h5: 5,
        h6: 6,
      };
      const headingLevel = levelMap[tagName] as 1 | 2 | 3 | 4 | 5 | 6;
      const headingMap: Record<
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
      const children = convertChildrenToRuns(el.childNodes);
      if (children.length > 0) {
        results.push(
          new Paragraph({
            heading: headingMap[headingLevel],
            alignment,
            spacing: { before: 240, after: 120 },
            children,
          }),
        );
      }
      break;
    }

    case "blockquote": {
      const children = convertChildrenToRuns(el.childNodes);
      if (children.length > 0) {
        results.push(
          new Paragraph({
            alignment,
            spacing: { before: 120, after: 120 },
            indent: { left: 720 },
            children,
          }),
        );
      }
      break;
    }

    case "ul": {
      Array.from(el.children).forEach((li) => {
        const liChildren = convertChildrenToRuns(li.childNodes);
        if (liChildren.length > 0) {
          results.push(
            new Paragraph({
              numbering: { reference: "bullet-list", level: 0 },
              spacing: { after: 60 },
              children: liChildren,
            }),
          );
        }
      });
      break;
    }

    case "ol": {
      Array.from(el.children).forEach((li) => {
        const liChildren = convertChildrenToRuns(li.childNodes);
        if (liChildren.length > 0) {
          results.push(
            new Paragraph({
              numbering: { reference: "ordered-list", level: 0 },
              spacing: { after: 60 },
              children: liChildren,
            }),
          );
        }
      });
      break;
    }

    case "table": {
      const tableRows: TableRow[] = [];
      Array.from(el.children).forEach((section) => {
        const sectionTag = section.tagName.toLowerCase();
        if (sectionTag === "thead" || sectionTag === "tbody") {
          Array.from(section.children).forEach((tr) => {
            const row = convertTableRow(
              tr as HTMLTableRowElement,
              sectionTag === "thead",
            );
            tableRows.push(row);
          });
        } else if (sectionTag === "tr") {
          const row = convertTableRow(section as HTMLTableRowElement, false);
          tableRows.push(row);
        }
      });

      if (tableRows.length > 0) {
        results.push(
          new Table({
            rows: tableRows,
          }),
        );
        results.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      }
      break;
    }

    case "img": {
      const src = el.getAttribute("src") || "";
      if (src) {
        results.push(
          new Paragraph({
            children: [new TextRun({ text: `[图片]` })],
          }),
        );
      }
      break;
    }
  }

  return results;
}

/**
 * 转换表格行
 */
function convertTableRow(tr: HTMLTableRowElement, isHeader: boolean): TableRow {
  const cells: TableCell[] = [];
  Array.from(tr.children).forEach((td) => {
    const tagName = td.tagName.toLowerCase();
    if (tagName === "td" || tagName === "th") {
      const cellEl = td as HTMLTableCellElement;
      const children = convertChildrenToRuns(cellEl.childNodes);
      const paragraphs =
        children.length > 0
          ? [new Paragraph({ children })]
          : [new Paragraph({ children: [new TextRun({ text: "" })] })];

      cells.push(
        new TableCell({
          children: paragraphs,
          shading: isHeader
            ? { fill: "F2F2F2", type: "clear" as any }
            : undefined,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        }),
      );
    }
  });
  return new TableRow({ children: cells });
}

/**
 * 将子节点列表转换为 TextRun 数组
 */
function convertChildrenToRuns(nodes: NodeListOf<ChildNode>): TextRun[] {
  const runs: TextRun[] = [];
  nodes.forEach((node) => {
    const tagName = (node as HTMLElement).tagName?.toLowerCase();

    if (tagName === "a") {
      const el = node as HTMLElement;
      const href = el.getAttribute("href") || "";
      const linkText = el.textContent || "";
      if (linkText.trim()) {
        runs.push(
          new TextRun({
            text: linkText,
            style: "Hyperlink",
          }),
        );
      }
      return;
    }

    runs.push(...convertTextRuns(node));
  });
  return runs;
}

/**
 * 将 HTML 字符串转换为 docx Document
 */
async function htmlToDocxDocument(html: string): Promise<Document> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;

  const children: (Paragraph | Table)[] = [];

  for (const node of Array.from(body.childNodes)) {
    const converted = convertBlockNode(node);
    children.push(...converted);
  }

  return new Document({
    numbering: { config: numberingConfig },
    styles: {
      default: {
        document: {
          run: {
            size: "24pt",
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
 * 导出 HTML 为 Word 文档
 */
async function exportHtmlToDocx(
  html: string,
  fileName = "freeEditor.docx",
): Promise<void> {
  const document = await htmlToDocxDocument(html);
  const blob = await Packer.toBlob(document);
  downloadFile(blob, fileName);
}

/**
 * 导出 Word 选项
 */
export interface ExportWordOptions {
  /**
   * 默认文件名
   */
  fileName?: string;
}

/**
 * ExportWord 扩展
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
          const html = getEditorHTML(editor);
          const fileName = this.options.fileName || "freeEditor.docx";
          // 异步导出，不阻塞命令链
          exportHtmlToDocx(html, fileName).catch((err) => {
            console.error("[ExportWord] 导出失败:", err);
          });
          return true;
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    exportWord: {
      /**
       * 导出当前编辑器内容为 Word 文档
       */
      exportWord: () => ReturnType;
    };
  }
}
