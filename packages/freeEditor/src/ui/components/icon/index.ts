/**
 * 创建图标元素 / Create icon element
 * @param svg - SVG 字符串 / SVG string
 * @returns 包装后的图标元素 / Wrapped icon element
 */
export function createIcon(svg: string): HTMLElement {
  const template = document.createElement("template");

  template.innerHTML = svg.trim();

  const svgElement = template.content.firstElementChild;

  if (!svgElement) {
    throw new Error("Invalid svg");
  }

  const wrapper = document.createElement("span");

  wrapper.className = "free-editor__svg";

  wrapper.appendChild(svgElement);

  return wrapper;
}
