import type { NodeView as ProseMirrorNodeView } from "@tiptap/pm/view";

import type { NodeViewRendererProps } from "@tiptap/core";

import { i18n } from "../../i18n/index";

/**
 * 操作按钮类型 / Action button type
 */
type ActionButtonType = "cancel" | "retry" | "remove";

/**
 * 操作按钮 class 映射 / Action button class mapping
 */
const ACTION_BUTTON_CLASSES: Record<ActionButtonType, string> = {
  cancel: "free-editor__media-node__action danger",
  retry: "free-editor__media-node__action primary",
  remove: "free-editor__media-node__action danger",
};

/**
 * 操作按钮 i18n key 映射 / Action button i18n key mapping
 */
const ACTION_BUTTON_I18N_KEYS: Record<ActionButtonType, string> = {
  cancel: "media.cancelUpload",
  retry: "media.retry",
  remove: "common.remove",
};

/**
 * 创建操作按钮 / Create action button
 * @param type 按钮类型 / Button type
 * @param onClick 点击回调 / Click callback
 * @returns 按钮元素 / Button element
 */
export function createActionButton(
  type: ActionButtonType,
  onClick: () => void,
): HTMLSpanElement {
  const btn = document.createElement("span");

  btn.className = ACTION_BUTTON_CLASSES[type];

  btn.textContent = i18n.t(ACTION_BUTTON_I18N_KEYS[type]);

  btn.onclick = (e: MouseEvent) => {
    e.preventDefault();

    e.stopPropagation();

    onClick();
  };

  return btn;
}

/**
 * 创建删除节点函数（用于 NodeViewRenderer）
 * Create delete node function (for NodeViewRenderer)
 * @param props NodeView 渲染器属性 / NodeView renderer props
 * @returns 删除节点函数 / Delete node function
 */
export function createDeleteNode(props: NodeViewRendererProps): () => void {
  return () => {
    const pos = props.getPos();

    if (typeof pos !== "number") {
      return;
    }

    props.editor
      .chain()
      .focus()
      .deleteRange({
        from: pos,
        to: pos + props.node.nodeSize,
      })
      .run();
  };
}

/**
 * 基础节点视图接口 / Base node view interface
 */
interface BaseNodeView<TAttrs> {
  /**
   * 获取根元素 / Get root element
   */
  getElement(): HTMLElement;

  /**
   * 更新属性 / Update attributes
   */
  update(attrs: TAttrs): void;

  /**
   * 销毁视图 / Destroy view
   */
  destroy(): void;
}

/**
 * 创建基础 ProseMirror 节点视图对象
 * Create base ProseMirror node view object
 *
 * 提取 dom / update / destroy 三个公共方法，
 * 调用方可在此基础上扩展 selectNode / deselectNode 等。
 *
 * @param view 节点视图实例 / Node view instance
 * @param props NodeView 渲染器属性 / NodeView renderer props
 * @returns 基础节点视图 / Base node view
 */
export function createBaseNodeView<TAttrs>(
  view: BaseNodeView<TAttrs>,
  props: NodeViewRendererProps,
): Pick<ProseMirrorNodeView, "dom" | "update" | "destroy"> {
  return {
    /**
     * 根 DOM 元素 / Root DOM element
     */
    dom: view.getElement(),

    /**
     * 更新节点 / Update node
     * @param updatedNode 更新后的节点 / Updated node
     * @returns 是否更新成功 / Whether update succeeded
     */
    update(updatedNode) {
      if (updatedNode.type.name !== props.node.type.name) {
        return false;
      }

      view.update(updatedNode.attrs as TAttrs);

      return true;
    },

    /**
     * 销毁视图 / Destroy view
     */
    destroy() {
      view.destroy();
    },
  };
}

/**
 * 订阅 i18n 语言变化 / Subscribe to i18n locale change
 *
 * 封装 i18n.subscribe，返回取消订阅函数，
 * 调用方须在 destroy() 中调用以防止内存泄漏。
 *
 * @param callback 语言变化回调 / Locale change callback
 * @returns 取消订阅函数 / Unsubscribe function
 */
export function subscribeI18n(callback: () => void): () => void {
  return i18n.subscribe(callback);
}

/**
 * 仅更新进度文本（上传过程中避免重建 DOM）
 * Update progress text only (avoid DOM rebuild during upload)
 *
 * @param wrapper 包装器元素 / Wrapper element
 * @param selector 进度元素选择器 / Progress element selector
 * @param progress 进度值 / Progress value
 * @returns 是否成功更新 / Whether update succeeded
 */
export function updateProgressText(
  wrapper: HTMLElement,
  selector: string,
  progress: number,
): boolean {
  const el = wrapper.querySelector(selector);

  if (el) {
    el.textContent = `${progress || 0}%`;

    return true;
  }

  return false;
}
