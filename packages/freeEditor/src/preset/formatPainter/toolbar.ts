import type { Editor } from "@tiptap/core";
import { createSimpleToolbar } from "../../ui/index";

import { i18n } from "../../core/index";

/**
 * 格式刷图标 SVG / Format painter icon SVG
 */
const FORMAT_PAINTER_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="6" x="2" y="2" rx="2"/><path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect width="4" height="6" x="8" y="16" rx="1"/></svg>
`;

/**
 * 已捕获的格式数据 / Captured format data
 */
interface CapturedMark {
  /** 标记名称 / Mark name */
  name: string;
  /** 标记属性 / Mark attributes */
  attrs: Record<string, unknown>;
}

interface CapturedNodeAttr {
  /** 属性名称 / Attribute name */
  name: string;
  /** 属性值 / Attribute value */
  value: unknown;
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
  return (editor.storage as unknown as Record<string, unknown>)[
    STORAGE_KEY
  ] as FormatPainterState;
}

/**
 * 设置格式刷内部状态 / Set format painter internal state
 *
 * @param editor 编辑器实例 / Editor instance
 * @param state 格式刷状态 / Format painter state
 */
function setState(editor: Editor, state: Partial<FormatPainterState>): void {
  Object.assign(
    (editor.storage as unknown as Record<string, unknown>)[
      STORAGE_KEY
    ] as object,
    state,
  );
}

/**
 * 过滤出非空的属性 / Filter non-empty attributes
 *
 * @param attrs 原始属性对象 / Original attributes object
 * @param excludeZero 是否排除 0 值 / Whether to exclude zero value
 * @returns 过滤后的属性对象 / Filtered attributes object
 */
function filterNonEmptyAttrs(
  attrs: Record<string, unknown>,
  excludeZero = false,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === "") continue;
    if (excludeZero && value === 0) continue;
    result[key] = value;
  }

  return result;
}

/**
 * 捕获 style mark 的非空属性 / Capture non-empty style mark attributes
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 捕获的标记列表 / Captured marks list
 */
function captureStyleMarks(editor: Editor): CapturedMark[] {
  const styleAttrs = editor.getAttributes("style");
  const filteredStyleAttrs = filterNonEmptyAttrs(styleAttrs);

  if (Object.keys(filteredStyleAttrs).length > 0) {
    return [{ name: "style", attrs: filteredStyleAttrs }];
  }

  return [];
}

/**
 * 捕获非 style 的标记（bold, italic, underline 等）/ Capture non-style marks
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 捕获的标记列表 / Captured marks list
 */
function captureOtherMarks(editor: Editor): CapturedMark[] {
  const marks: CapturedMark[] = [];
  const markTypes = Object.values(editor.schema.marks);

  for (const markType of markTypes) {
    if (EXCLUDED_MARKS.has(markType.name)) continue;

    if (editor.isActive(markType.name)) {
      const attrs = editor.getAttributes(markType.name);
      const filteredAttrs = filterNonEmptyAttrs(attrs);
      marks.push({ name: markType.name, attrs: filteredAttrs });
    }
  }

  return marks;
}

/** 属性值是否有实际内容 / Whether an attribute value is meaningful. */
function isValidAttrValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== 0 && value !== "";
}

/** 从单个节点上按配置采集命中的属性 / Collect matched node attrs from a single node. */
function captureNodeAttrForNode(node: {
  type: { name: string };
  attrs: Record<string, unknown>;
}): CapturedNodeAttr[] {
  const captured: CapturedNodeAttr[] = [];

  for (const [attrName, targetTypes] of Object.entries(NODE_ATTR_CONFIG)) {
    if (targetTypes.includes(node.type.name)) {
      const value = node.attrs[attrName];

      if (isValidAttrValue(value)) {
        captured.push({ name: attrName, value });
      }
    }
  }

  return captured;
}

/**
 * 捕获节点属性（alignment, lineHeight, indent）/ Capture node attributes
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 捕获的节点属性列表 / Captured node attributes list
 */
function captureNodeAttributes(editor: Editor): CapturedNodeAttr[] {
  const nodeAttrs: CapturedNodeAttr[] = [];
  const { $from } = editor.state.selection;

  for (let d = $from.depth; d >= 0; d--) {
    const node = $from.node(d);

    if (node) {
      nodeAttrs.push(...captureNodeAttrForNode(node));
      break;
    }
  }

  return nodeAttrs;
}

/**
 * 捕获当前选区的格式 / Capture format from current selection
 *
 * @param editor 编辑器实例 / Editor instance
 * @returns 捕获的格式数据 / Captured format data
 */
function captureFormat(editor: Editor): FormatData {
  const marks: CapturedMark[] = [
    ...captureStyleMarks(editor),
    ...captureOtherMarks(editor),
  ];
  const nodeAttrs = captureNodeAttributes(editor);

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

  // 清除所有未在捕获数据中的标记 / Clear marks not in captured data
  const capturedMarkNames = new Set(marks.map((m) => m.name));
  const markTypes = Object.values(editor.schema.marks);

  const chain = editor.chain();

  for (const markType of markTypes) {
    if (!capturedMarkNames.has(markType.name)) {
      chain.unsetMark(markType.name);
    }
  }

  // 应用捕获的标记 / Apply captured marks
  for (const mark of marks) {
    chain.setMark(mark.name, mark.attrs);
  }

  chain.run();

  // 应用节点属性（使用事务直接操作，因为 chain 不支持 setNodeAttribute）
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
  if (!(editor.storage as unknown as Record<string, unknown>)[STORAGE_KEY]) {
    (editor.storage as unknown as Record<string, unknown>)[STORAGE_KEY] = {
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

    /** 鼠标是否正在按下（用于区分鼠标拖拽和键盘选区） */
    let isPointerDown = false;

    /** 是否已经应用过格式（防止重复触发） */
    let applied = false;

    /**
     * 应用格式并退出 / Apply format and exit
     */
    function applyAndDeactivate(): void {
      if (applied) return;
      applied = true;

      const { selection } = editor.state;

      if (!selection.empty) {
        applyFormat(editor, formatData);
      }

      deactivate();
    }

    /**
     * 编辑区 pointerdown：鼠标按下，标记拖拽开始
     */
    function onPointerDown(): void {
      isPointerDown = true;
    }

    /**
     * 编辑区 pointerup：鼠标释放
     */
    function onPointerUp(): void {
      isPointerDown = false;

      const { selection } = editor.state;

      if (!selection.empty) {
        applyAndDeactivate();
      }
    }

    /**
     * 选区变化
     */
    function onSelectionUpdate(): void {
      if (isPointerDown) return;
      if (applied) return;

      const { selection } = editor.state;

      if (!selection.empty) {
        applyAndDeactivate();
      }
    }

    // 注册事件监听 / Register event listeners
    const editorDom = editor.view.dom;

    editorDom.addEventListener("pointerdown", onPointerDown);
    editorDom.addEventListener("pointerup", onPointerUp);
    editor.on("selectionUpdate", onSelectionUpdate);

    // 存储清理函数 / Store cleanup function
    setState(editor, {
      active: true,
      formatData,
      cleanup: () => {
        editorDom.removeEventListener("pointerdown", onPointerDown);
        editorDom.removeEventListener("pointerup", onPointerUp);
        editor.off("selectionUpdate", onSelectionUpdate);
      },
    });

    // 添加格式刷类名到编辑器根容器
    // Add format painter class to editor root container
    const root = editorDom.closest(".free-editor");

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
    tooltip: i18n.t("toolbar.formatPainter"),
    isActive: () => getState(editor)?.active || false,
    onClick: () => toggle(),
  });

  const render = (): void => {
    wrapper.classList.toggle("is-active", getState(editor)?.active || false);
  };

  // 销毁时清理 / Clean up on destroy
  const wrapperWithDestroy = wrapper as HTMLElement & { destroy?: () => void };
  const originalDestroy = wrapperWithDestroy.destroy;

  wrapperWithDestroy.destroy = (): void => {
    deactivate();
    originalDestroy?.();
  };

  return wrapper;
}
