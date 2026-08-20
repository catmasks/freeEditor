import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

import { createSimpleToolbar } from "../../ui/index";
import { i18n } from "../../core/index";

/**
 * 清除样式图标 SVG / Clear style icon SVG
 */
const CLEAR_STYLE_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/>
  <path d="m5.082 11.09 8.828 8.828"/>
</svg>
`;

/**
 * 需要清除的节点属性列表 / Node attributes to clear
 *
 */
const NODE_ATTRS_TO_CLEAR = [
  "alignment",
  "lineHeight",
  "indent",
  "textAlign",
  "marginLeft",
  "marginRight",
  "paddingLeft",
  "paddingRight",
] as const;

/**
 * 节点属性名称 / Node attribute name
 */
type NodeAttrName = (typeof NODE_ATTRS_TO_CLEAR)[number];

/**
 * 获取当前选区需要处理的节点位置
 *
 * 支持：
 *
 * 1. 有文本选区
 *    - 处理选区范围内的所有 textblock
 *
 * 2. 空选区
 *    - 处理当前光标所在的 textblock
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 需要处理的节点位置 / Node positions to process
 */
function getTargetNodePositions(editor: Editor): number[] {
  const { selection, doc } = editor.state;
  const positions = new Set<number>();

  /**
   * 空选区：
   */
  if (selection.empty) {
    const { $from } = selection;

    for (let depth = $from.depth; depth > 0; depth--) {
      const node = $from.node(depth);

      if (node.isTextblock) {
        positions.add($from.before(depth));
        break;
      }
    }

    return [...positions];
  }

  /**
   * 非空选区：
   */
  doc.nodesBetween(
    selection.from,
    selection.to,
    (node: ProseMirrorNode, pos: number) => {
      if (node.isTextblock) {
        positions.add(pos);
      }
    },
  );

  return [...positions];
}

/**
 * 判断节点是否存在需要清除的属性
 *
 * @param node ProseMirror 节点 / ProseMirror node
 * @returns 是否存在需要清除的属性 / Whether node has clearable attributes
 */
function hasClearableNodeAttributes(node: ProseMirrorNode): boolean {
  return NODE_ATTRS_TO_CLEAR.some((attr) => attr in node.attrs);
}

/**
 * 获取节点属性在 Schema 中定义的默认值
 *
 * @param node 节点 / Node
 * @param attr 属性名称 / Attribute name
 * @returns
 * Schema 默认值；
 * 如果属性不存在或没有定义 default，则返回 undefined
 */
function getDefaultNodeAttr(
  node: ProseMirrorNode,
  attr: NodeAttrName,
): unknown {
  const attrSpec = node.type.spec.attrs?.[attr];

  /**
   * 当前节点没有定义这个属性。
   */
  if (!attrSpec) {
    return undefined;
  }

  /**
   * 只有 Schema 明确定义 default 时才允许恢复。
   */
  return attrSpec.default;
}

/**
 * 判断节点是否为可处理的目标文本块节点
 *
 * @param node ProseMirror 节点
 * @returns 是否为有效的目标节点
 */
function isValidTargetNode(
  node: ProseMirrorNode | null,
): node is ProseMirrorNode {
  return node !== null && !node.isInline && node.isTextblock;
}

/**
 * 将节点属性重置为 Schema 默认值
 *
 * 遍历需要清除的属性列表，将节点属性恢复为 Schema 中定义的默认值。
 *
 * @param node ProseMirror 节点
 * @returns 修改后的属性对象，若无变化则返回 null
 */
function resetNodeAttrsToDefaults(
  node: ProseMirrorNode,
): Record<string, unknown> | null {
  const nextAttrs = { ...node.attrs };
  let changed = false;

  for (const attr of NODE_ATTRS_TO_CLEAR) {
    if (!(attr in node.attrs)) {
      continue;
    }

    const defaultValue = getDefaultNodeAttr(node, attr);

    if (defaultValue === undefined) {
      continue;
    }

    if (node.attrs[attr] !== defaultValue) {
      nextAttrs[attr] = defaultValue;
      changed = true;
    }
  }

  return changed ? nextAttrs : null;
}

/**
 * 清除节点属性 / Clear node attributes
 *
 * 将节点属性恢复为 Schema 中定义的默认值。
 *
 * @param editor 编辑器实例 / Editor instance
 */
function clearNodeAttributes(editor: Editor): void {
  const { state, view } = editor;

  const positions = getTargetNodePositions(editor);

  if (positions.length === 0) {
    return;
  }

  const tr = state.tr;
  let changed = false;

  for (const pos of positions) {
    const node = tr.doc.nodeAt(pos);

    if (!isValidTargetNode(node)) {
      continue;
    }

    if (!hasClearableNodeAttributes(node)) {
      continue;
    }

    const nextAttrs = resetNodeAttrsToDefaults(node);

    if (!nextAttrs) {
      continue;
    }

    tr.setNodeMarkup(pos, undefined, nextAttrs);

    changed = true;
  }

  if (changed) {
    view.dispatch(tr);
  }
}

/**
 * 清除选中文本的所有样式 / Clear all styles from selected text
 *
 * 清除范围：
 *
 * 1. 所有可以清除的 Mark
 * 2. 标题、列表等块级节点结构
 * 3. 自定义节点样式属性
 *
 * @param editor 编辑器实例 / Editor instance
 */
function clearFormat(editor: Editor): void {
  /**
   * 清除所有行内 Mark，并将块级节点恢复为普通 paragraph。
   */
  editor.chain().focus().unsetAllMarks().clearNodes().run();

  /**
   * 节点类型转换完成以后，再恢复自定义节点属性。
   */
  clearNodeAttributes(editor);
}

/**
 * 创建清除样式工具栏按钮 / Create clear style toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createClearFormatToolbar(editor: Editor): HTMLElement {
  return createSimpleToolbar({
    editor,
    iconSvg: CLEAR_STYLE_ICON,
    tooltip: i18n.t("toolbar.clearFormat"),

    /**
     * 点击按钮清除当前选区的所有样式。
     */
    onClick: () => {
      clearFormat(editor);
    },
  });
}
