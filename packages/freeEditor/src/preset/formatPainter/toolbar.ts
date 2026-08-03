import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../toolbar";

import { i18n } from "../../core/index";

/**
 * 格式刷图标 SVG / Format painter icon SVG
 */
const FORMAT_PAINTER_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="6" x="2" y="2" rx="2"/><path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect width="4" height="6" x="8" y="16" rx="1"/></svg>
`;

/**
 * 已捕获的格式数据 / Captured format data
 */
interface CapturedMark {
  /** 标记名称 / Mark name */
  name: string;
  /** 标记属性 / Mark attributes */
  attrs: Record<string, any>;
}

interface CapturedNodeAttr {
  /** 属性名称 / Attribute name */
  name: string;
  /** 属性值 / Attribute value */
  value: any;
}

interface FormatData {
  /** 捕获的标记列表 / Captured marks list */
  marks: CapturedMark[];
  /** 捕获的节点属性 / Captured node attributes */
  nodeAttrs: CapturedNodeAttr[];
}

/**
 * 格式刷内部状态 / Format painter internal state
 */
interface FormatPainterState {
  /** 是否处于刷格式模式 / Whether in painting mode */
  active: boolean;
  /** 已捕获的格式数据 / Captured format data */
  formatData: FormatData | null;
  /** 清理函数 / Cleanup function */
  cleanup: (() => void) | null;
}

/**
 * 需要排除的标记类型名称（不参与格式刷的标记）/ Mark types to exclude
 */
const EXCLUDED_MARKS = new Set<string>(["style"]);

/**
 * 需要处理的节点属性列表（名称 → 对应节点类型）/ Node attributes to handle (name → target node types)
 */
const NODE_ATTR_CONFIG: Record<string, string[]> = {
  alignment: ["paragraph", "heading"],
  lineHeight: ["paragraph", "heading"],
  indent: ["paragraph", "heading"],
};

/**
 * 格式刷内部状态存储键 / Storage key for format painter state
 */
const STORAGE_KEY = "formatPainter";

/**
 * 获取格式刷内部状态 / Get format painter internal state
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 格式刷状态 / Format painter state
 */
function getState(editor: Editor): FormatPainterState {
  return (editor.storage as any)[STORAGE_KEY] as FormatPainterState;
}

/**
 * 设置格式刷内部状态 / Set format painter internal state
 *
 * @param editor 编辑器实例 / Editor instance
 * @param state 格式刷状态 / Format painter state
 */
function setState(editor: Editor, state: Partial<FormatPainterState>): void {
  Object.assign((editor.storage as any)[STORAGE_KEY], state);
}

/**
 * 捕获当前选区的格式 / Capture format from current selection
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 捕获的格式数据 / Captured format data
 */
function captureFormat(editor: Editor): FormatData {
  const marks: CapturedMark[] = [];
  const nodeAttrs: CapturedNodeAttr[] = [];

  // 1. 捕获 style mark 的非空属性 / Capture non-empty style mark attributes
  const styleAttrs = editor.getAttributes("style");
  const filteredStyleAttrs: Record<string, any> = {};

  for (const [key, value] of Object.entries(styleAttrs)) {
    if (value !== null && value !== undefined && value !== "") {
      filteredStyleAttrs[key] = value;
    }
  }

  if (Object.keys(filteredStyleAttrs).length > 0) {
    marks.push({ name: "style", attrs: filteredStyleAttrs });
  }

  // 2. 捕获其他标记（bold, italic, underline, strike, superscript, subscript, inlineCode, link）
  // Capture other marks
  const markTypes = Object.values(editor.schema.marks);

  for (const markType of markTypes) {
    if (EXCLUDED_MARKS.has(markType.name)) continue;

    if (editor.isActive(markType.name)) {
      const attrs = editor.getAttributes(markType.name);
      const filteredAttrs: Record<string, any> = {};

      for (const [key, value] of Object.entries(attrs)) {
        if (value !== null && value !== undefined && value !== "") {
          filteredAttrs[key] = value;
        }
      }

      marks.push({ name: markType.name, attrs: filteredAttrs });
    }
  }

  // 3. 捕获节点属性（alignment, lineHeight, indent）/ Capture node attributes
  const { $from } = editor.state.selection;

  for (let d = $from.depth; d >= 0; d--) {
    const node = $from.node(d);

    if (node) {
      for (const [attrName, targetTypes] of Object.entries(NODE_ATTR_CONFIG)) {
        if (targetTypes.includes(node.type.name)) {
          const value = node.attrs[attrName];

          if (
            value !== null &&
            value !== undefined &&
            value !== 0 &&
            value !== ""
          ) {
            nodeAttrs.push({ name: attrName, value });
          }
        }
      }

      break;
    }
  }

  return { marks, nodeAttrs };
}

/**
 * 应用已捕获的格式到当前选区 / Apply captured format to current selection
 *
 * @param editor 编辑器实例 / Editor instance
 * @param formatData 已捕获的格式数据 / Captured format data
 */
function applyFormat(editor: Editor, formatData: FormatData): void {
  const { marks, nodeAttrs } = formatData;

  // 1. 清除所有未在捕获数据中的标记 / Clear marks not in captured data
  const capturedMarkNames = new Set(marks.map((m) => m.name));
  const markTypes = Object.values(editor.schema.marks);

  const chain = editor.chain();

  for (const markType of markTypes) {
    if (!capturedMarkNames.has(markType.name)) {
      chain.unsetMark(markType.name);
    }
  }

  // 2. 应用捕获的标记 / Apply captured marks
  for (const mark of marks) {
    chain.setMark(mark.name, mark.attrs);
  }

  chain.run();

  // 3. 应用节点属性（使用事务直接操作，因为 chain 不支持 setNodeAttribute）
  // Apply node attributes (using transaction directly since chain doesn't support setNodeAttribute)
  if (nodeAttrs.length > 0) {
    const { selection } = editor.state;
    const { $from, $to } = selection;
    const { doc } = editor.state;
    const tr = editor.state.tr;

    for (const attr of nodeAttrs) {
      const targetTypes = NODE_ATTR_CONFIG[attr.name];

      if (targetTypes) {
        doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
          if (targetTypes.includes(node.type.name)) {
            tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              [attr.name]: attr.value,
            });
          }
        });
      }
    }

    editor.view.dispatch(tr);
  }
}

/**
 * 创建格式刷工具栏按钮 / Create format painter toolbar button
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createFormatPainterToolbar(editor: Editor): HTMLElement {
  // 初始化状态存储 / Initialize state storage
  if (!(editor.storage as any)[STORAGE_KEY]) {
    (editor.storage as any)[STORAGE_KEY] = {
      active: false,
      formatData: null,
      cleanup: null,
    } as FormatPainterState;
  }

  /**
   * 退出格式刷模式 / Exit format painter mode
   */
  function deactivate(): void {
    const state = getState(editor);

    if (!state.active) return;

    // 清理事件监听 / Clean up event listeners
    state.cleanup?.();
    setState(editor, { active: false, formatData: null, cleanup: null });

    // 移除编辑器根容器的格式刷类名 / Remove format painter class from editor root
    const root = editor.view.dom.closest(".free-editor");

    if (root) {
      root.classList.remove("free-editor--format-painter");
    }

    wrapper.classList.remove("is-active");
    render();
  }

  /**
   * 应用格式并退出刷模式 / Apply format and exit painter mode
   */
  function applyAndDeactivate(): void {
    const state = getState(editor);

    if (!state.active || !state.formatData) return;

    const { selection } = editor.state;

    // 仅当选区非空时应用格式 / Only apply when selection is non-empty
    if (!selection.empty) {
      applyFormat(editor, state.formatData);
    }

    deactivate();
  }

  /**
   * 选区更新处理函数 / Selection update handler
   */
  function onSelectionUpdate(): void {
    const state = getState(editor);

    if (state.active && state.formatData) {
      applyAndDeactivate();
    }
  }

  /**
   * 键盘事件处理函数 / Keyboard event handler
   */
  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      deactivate();
    }
  }

  /**
   * 进入格式刷模式 / Enter format painter mode
   */
  function activate(): void {
    // 捕获当前格式 / Capture current format
    const formatData = captureFormat(editor);

    // 如果没有捕获到任何格式，不进入刷模式
    // If no format was captured, don't enter painter mode
    if (formatData.marks.length === 0 && formatData.nodeAttrs.length === 0) {
      return;
    }

    // 注册事件监听 / Register event listeners
    editor.on("selectionUpdate", onSelectionUpdate);

    const keyDownHandler = (event: KeyboardEvent) => onKeyDown(event);
    document.addEventListener("keydown", keyDownHandler);

    // 存储清理函数 / Store cleanup function
    setState(editor, {
      active: true,
      formatData,
      cleanup: () => {
        editor.off("selectionUpdate", onSelectionUpdate);
        document.removeEventListener("keydown", keyDownHandler);
      },
    });

    // 添加格式刷类名到编辑器根容器
    // Add format painter class to editor root container
    const root = editor.view.dom.closest(".free-editor");

    if (root) {
      root.classList.add("free-editor--format-painter");
    }

    wrapper.classList.add("is-active");
    render();
  }

  /**
   * 切换格式刷模式 / Toggle format painter mode
   */
  function toggle(): void {
    const state = getState(editor);

    if (state.active) {
      deactivate();
    } else {
      activate();
    }
  }

  const wrapper = createSimpleToolbar({
    editor,
    iconSvg: FORMAT_PAINTER_ICON,
    tooltip: { text: i18n.t("toolbar.formatPainter"), keyboard: "Esc" },
    isActive: () => getState(editor)?.active || false,
    onClick: () => toggle(),
  });

  const render = () => {
    wrapper.classList.toggle("is-active", getState(editor)?.active || false);
  };

  // 销毁时清理 / Clean up on destroy
  const originalDestroy = (wrapper as any).destroy;

  (wrapper as any).destroy = () => {
    deactivate();
    originalDestroy?.();
  };

  return wrapper;
}
