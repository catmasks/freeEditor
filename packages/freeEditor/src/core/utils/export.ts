import type { Node } from "@tiptap/pm/model";

/**
 * 下载文件 / Download file
 *
 * 仅适用于浏览器环境。
 *
 * @param data 文件内容 / File content
 * @param fileName 文件名 / File name
 */
export function downloadFile(
  data: Blob | ArrayBuffer | Uint8Array,
  fileName: string,
): void {
  try {
    const blob = data instanceof Blob ? data : new Blob([data as BlobPart]);

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
  } catch (error) {
    console.error("[downloadFile] 下载文件失败:", error);

    throw error;
  }
}

/**
 * 判断节点是否包含实际文本内容 / Check whether a node contains actual text content
 *
 * 用于判断 paragraph、heading 等文本块是否真正包含用户输入的内容。
 *
 * @param node ProseMirror 节点 / ProseMirror node
 * @returns 是否包含实际文本 / Whether the node contains actual text
 */
function hasTextContent(node: Node): boolean {
  /**
   * 文本节点直接判断文本内容。
   *
   * 纯空格不视为有效内容。
   */
  if (node.isText) {
    return Boolean(node.text?.trim());
  }

  /**
   * 继续检查子节点。
   */
  let hasContent = false;

  node.forEach((child) => {
    if (hasContent) {
      return;
    }

    if (hasTextContent(child)) {
      hasContent = true;
    }
  });

  return hasContent;
}

/**
 * 判断顶层节点是否包含有效内容 / Check whether a top-level node contains meaningful content
 *
 * @param node Document 的直接子节点 / Direct child of Document
 * @returns 是否包含有效内容 / Whether the node contains meaningful content
 */
function isMeaningfulTopLevelNode(node: Node): boolean {
  /**
   * 文本块需要检查内部是否存在实际文本。
   */
  if (node.isTextblock) {
    return hasTextContent(node);
  }

  /**
   * Leaf / Atom 节点本身就是有效内容。
   *
   * 例如：
   * - image
   * - mention
   * - horizontalRule
   * - emoji
   * - 自定义 atom Node
   */
  if (node.isLeaf) {
    return true;
  }

  /**
   * 其他非文本块的顶层结构节点，
   * 只要存在于 Document 中，就认为编辑器已经存在内容。
   *
   * 例如：
   * - table
   * - blockquote
   * - bulletList
   * - orderedList
   * - 自定义 block Node
   */
  return true;
}

/**
 * 判断编辑器文档是否为空 / Check whether the editor document is empty
 *
 * 这里只判断 Document 的直接子节点。
 *
 * @param doc ProseMirror Document 节点 / ProseMirror document node
 * @returns 是否为空文档 / Whether the document is empty
 */
export function isEmptyDocument(doc: Node): boolean {
  let hasContent = false;

  /**
   * 只检查 Document 的直接子节点。
   *
   * 不使用 descendants()，
   * 避免把 table、blockquote、list 等内部节点当成编辑器内容。
   */
  doc.forEach((node) => {
    if (hasContent) {
      return;
    }

    if (isMeaningfulTopLevelNode(node)) {
      hasContent = true;
    }
  });

  return !hasContent;
}
