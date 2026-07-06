import { FloatingManager } from "../FloatingToolbar/FloatingManager";

/**
 * 创建工具栏按钮 / Create toolbar button
 * @param content - 按钮内容元素 / Button content element
 * @param tooltip - 提示文本 / Tooltip text
 * @returns 按钮 DOM 元素 / Button DOM element
 */
export function createToolbarButton(content: HTMLElement, tooltip: string) {
  const item = document.createElement("div");
  item.className = "free-editor__toolbar__item";

  const tooltipEl = document.createElement("div");
  tooltipEl.className = "free-editor__tooltip--portal";
  tooltipEl.innerText = tooltip;

  tooltipEl.style.position = "fixed";
  tooltipEl.style.zIndex = "2000";
  tooltipEl.style.display = "none";
  tooltipEl.style.pointerEvents = "none";
  tooltipEl.style.whiteSpace = "nowrap";

  document.body.appendChild(tooltipEl);

  const fm = FloatingManager.getInstance();

  const unsubscribe = fm.onActiveChange((activeId) => {
    if (activeId) {
      hide();
    }
  });

  const show = () => {
    const fm = FloatingManager.getInstance();
    const activeId = fm.getActiveId();

    const rect = item.getBoundingClientRect();

    const targetLeft = rect.left + rect.width / 2;
    const targetTop = rect.bottom + 6;

    let blocked = false;

    let tooltipWidth = 0;
    let tooltipHeight = 0;

    tooltipEl.style.left = "0px";
    tooltipEl.style.top = "0px";
    tooltipEl.style.display = "block";

    const tooltipRect = tooltipEl.getBoundingClientRect();
    tooltipWidth = tooltipRect.width;
    tooltipHeight = tooltipRect.height;

    const left = targetLeft - tooltipWidth / 2;
    const top = targetTop;

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

  item.addEventListener("mouseenter", show);
  item.addEventListener("mouseleave", hide);

  item.appendChild(content);

  const destroy = () => {
    tooltipEl.remove();
    item.removeEventListener("mouseenter", show);
    item.removeEventListener("mouseleave", hide);

    unsubscribe();
  };

  (item as any).__tooltipDestroy = destroy;

  return item;
}
