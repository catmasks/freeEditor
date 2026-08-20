/**
 * 将字符串或 HTMLElement 内容挂载到容器 / Mount string or HTMLElement content into a container
 * @param container 目标容器 / Target container
 * @param content 内容 / Content
 */
export function appendContent(
  container: HTMLElement,
  content: string | HTMLElement,
): void {
  if (typeof content === "string") {
    container.innerHTML = content;
  } else {
    container.appendChild(content);
  }
}

/**
 * 判断事件目标是否为表单控件 / Whether the event target is a form control
 *
 * 表单控件（input/textarea/select）需要获得焦点才能操作，不应被防失焦逻辑拦截。
 *
 * @param target 事件目标 / Event target
 * @returns 是否为表单控件 / Whether it is a form control
 */
export function isFormControl(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement && !!target.closest("input, textarea, select")
  );
}

/**
 * 将数值钳制到 [min, max] 区间 / Clamp a number into the [min, max] range
 * @param value 数值 / Value
 * @param min 最小值 / Minimum
 * @param max 最大值 / Maximum
 * @returns 钳制后的数值 / Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
