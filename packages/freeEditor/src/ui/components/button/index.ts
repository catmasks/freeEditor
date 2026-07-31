import { FloatingManager } from "../FloatingToolbar/FloatingManager";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

/**
 * 提示文本配置 / Tooltip content configuration
 */
export interface TooltipContent {
  /**
   * 提示文本 / Tooltip text
   */
  text: string;
  /**
   * 快捷键提示 / Keyboard shortcut hint
   */
  keyboard?: string;
}

export type TooltipType = string | TooltipContent;

export interface TooltipBindResult {
  destroy: () => void;
}

export interface BindTooltipOptions {
  /**
   * 是否跳过浮动工具栏的重叠检测和隐藏逻辑
   * Whether to skip floating toolbar overlap check and hide logic
   */
  skipFloatingCheck?: boolean;

  /**
   * 提示显示位置 / Tooltip placement
   * @default "bottom"
   */
  placement?: TooltipPlacement;
}

const GAP = 6;

function calcTooltipPosition(
  targetRect: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
  placement: TooltipPlacement,
): { left: number; top: number } {
  switch (placement) {
    case "top":
      return {
        left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        top: targetRect.top - tooltipHeight - GAP,
      };
    case "bottom":
      return {
        left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        top: targetRect.bottom + GAP,
      };
    case "left":
      return {
        left: targetRect.left - tooltipWidth - GAP,
        top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
      };
    case "right":
      return {
        left: targetRect.right + GAP,
        top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
      };
  }
}

export function bindTooltip(
  target: HTMLElement,
  tooltip: TooltipType,
  options: BindTooltipOptions = {},
): TooltipBindResult {
  const { skipFloatingCheck = false, placement = "bottom" } = options;

  const tooltipEl = document.createElement("div");
  tooltipEl.className = "free-editor__tooltip--portal";

  // 解析 tooltip 内容，支持带快捷键的配置
  const tooltipText = typeof tooltip === "string" ? tooltip : tooltip.text;
  const tooltipKeyboard =
    typeof tooltip === "string" ? undefined : tooltip.keyboard;

  // 构建 tooltip 内部结构
  const textEl = document.createElement("div");
  textEl.className = "free-editor__tooltip--text";
  textEl.textContent = tooltipText;
  tooltipEl.appendChild(textEl);

  // 如果有快捷键，在提示文本下方显示
  if (tooltipKeyboard) {
    const keyboardEl = document.createElement("div");
    keyboardEl.className = "free-editor__tooltip--keyboard";
    keyboardEl.textContent = tooltipKeyboard;
    tooltipEl.appendChild(keyboardEl);
  }

  tooltipEl.style.position = "fixed";
  tooltipEl.style.zIndex = "3000";
  tooltipEl.style.display = "none";
  tooltipEl.style.pointerEvents = "none";
  tooltipEl.style.whiteSpace = "nowrap";

  document.body.appendChild(tooltipEl);

  let unsubscribe: (() => void) | null = null;

  if (!skipFloatingCheck) {
    const fm = FloatingManager.getInstance();
    unsubscribe = fm.onActiveChange((activeId) => {
      if (activeId) {
        hide();
      }
    });
  }

  const show = () => {
    const rect = target.getBoundingClientRect();

    let blocked = false;

    let tooltipWidth = 0;
    let tooltipHeight = 0;

    tooltipEl.style.left = "0px";
    tooltipEl.style.top = "0px";
    tooltipEl.style.display = "block";

    const tooltipRect = tooltipEl.getBoundingClientRect();
    tooltipWidth = tooltipRect.width;
    tooltipHeight = tooltipRect.height;

    const { left, top } = calcTooltipPosition(
      rect,
      tooltipWidth,
      tooltipHeight,
      placement,
    );

    if (!skipFloatingCheck) {
      const fm = FloatingManager.getInstance();
      const activeId = fm.getActiveId();

      if (activeId) {
        const active = (fm as any).instances?.get(activeId);
        const floatingEl = active?.getToolbarEl?.();

        if (floatingEl) {
          const fr = floatingEl.getBoundingClientRect();

          const willOverlap = !(
            left + tooltipWidth < fr.left ||
            left > fr.right ||
            top + tooltipHeight < fr.top ||
            top > fr.bottom
          );

          if (willOverlap) {
            blocked = true;
          }
        }
      }
    }

    if (blocked) {
      tooltipEl.style.display = "none";
      return;
    }

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
  };

  const hide = () => {
    tooltipEl.style.display = "none";
  };

  target.addEventListener("mouseenter", show);
  target.addEventListener("mouseleave", hide);

  const destroy = () => {
    tooltipEl.remove();
    target.removeEventListener("mouseenter", show);
    target.removeEventListener("mouseleave", hide);

    unsubscribe?.();
  };

  return { destroy };
}

/**
 * 创建工具栏按钮 / Create toolbar button
 * @param content - 按钮内容元素 / Button content element
 * @param tooltip - 提示文本（支持字符串或带快捷键的配置对象）/ Tooltip text (supports string or config object with keyboard shortcut)
 * @param options - 配置选项 / Options
 * @returns 按钮 DOM 元素 / Button DOM element
 */
export function createToolbarButton(
  content: HTMLElement,
  tooltip: TooltipType,
  options?: Omit<BindTooltipOptions, "skipFloatingCheck">,
) {
  const item = document.createElement("div");
  item.className = "free-editor__toolbar__item";

  const { destroy } = bindTooltip(item, tooltip, options);

  item.appendChild(content);

  (item as any).__tooltipDestroy = destroy;

  return item;
}
