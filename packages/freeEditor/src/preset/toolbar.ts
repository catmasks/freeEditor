import type { Editor } from "@tiptap/core";
import {
  createToolbarButton,
  createIcon,
  ColorPickerDropdown,
  Select,
} from "../ui/index";
import type { SelectOption } from "../ui/index";

/**
 * 简单工具栏按钮配置项 / Configuration options for a simple toolbar button
 */
export interface SimpleToolbarOptions {
  /**
   * 编辑器实例 / The editor instance
   */
  editor: Editor;
  /**
   * 图标 SVG 字符串 / The icon SVG string
   */
  iconSvg: string;
  /**
   * 提示文本 / The tooltip text
   */
  tooltip: string;
  /**
   * 判断是否处于激活状态的函数 / Function to determine if the button is active
   */
  isActive?: () => boolean;
  /**
   * 点击事件回调 / Click event callback
   */
  onClick: () => void;
}

/**
 * 创建简单工具栏按钮 / Creates a simple toolbar button
 *
 * 统一处理：图标渲染、tooltip、激活状态切换、pointerdown 防失焦、click 事件、编辑器状态监听
 * Handles uniformly: icon rendering, tooltip, active state toggling, pointerdown blur prevention, click events, editor state listening
 *
 * @param options 配置项 / Configuration options
 * @returns 工具栏按钮元素 / Toolbar button element
 */
export function createSimpleToolbar(
  options: SimpleToolbarOptions,
): HTMLElement {
  const { editor, iconSvg, tooltip, isActive, onClick } = options;

  const wrapper = createToolbarButton(createIcon(iconSvg), tooltip);

  const render = () => {
    wrapper.classList.toggle("is-active", isActive?.() || false);
  };

  wrapper.addEventListener("pointerdown", (event) => {
    event.preventDefault();
  });

  wrapper.addEventListener("click", () => {
    onClick();
    render();
  });

  editor.on("selectionUpdate", render);
  editor.on("transaction", render);

  render();

  return wrapper;
}

/**
 * 颜色选择器工具栏配置项 / Configuration options for a color picker toolbar
 */
export interface ColorPickerToolbarOptions {
  /**
   * 编辑器实例 / The editor instance
   */
  editor: Editor;
  /**
   * 图标 SVG 字符串 / The icon SVG string
   */
  iconSvg: string;
  /**
   * 提示文本 / The tooltip text
   */
  tooltip: string;
  /**
   * 获取当前颜色值的函数 / Function to get the current color value
   */
  getCurrentColor: () => string | null;
  /**
   * 设置颜色的回调函数 / Callback function to set the color
   */
  setColor: (color: string | null) => void;
}

/**
 * 创建颜色选择器工具栏 / Creates a color picker toolbar
 *
 * 统一处理：颜色获取、下拉面板、图标颜色同步、destroy 资源清理
 * Handles uniformly: color retrieval, dropdown panel, icon color sync, destroy resource cleanup
 *
 * @param options 配置项 / Configuration options
 * @returns 颜色选择器工具栏元素 / Color picker toolbar element
 */
export function createColorPickerToolbar(
  options: ColorPickerToolbarOptions,
): HTMLElement {
  const { editor, iconSvg, tooltip, getCurrentColor, setColor } = options;

  const icon = createIcon(iconSvg);
  const wrapper = createToolbarButton(icon, tooltip);
  const svg = icon.querySelector("svg");

  const dropdown = new ColorPickerDropdown({
    target: wrapper,
    placement: "bottom-center",
    value: getCurrentColor(),
    onChange: (color) => {
      setColor(color);
      render();
    },
  });

  const render = () => {
    const color = getCurrentColor();
    wrapper.classList.toggle("is-active", !!color);
    dropdown.setValue(color);
    if (svg) {
      svg.style.color = color || "";
    }
  };

  wrapper.addEventListener("pointerdown", (event) => {
    event.preventDefault();
  });

  wrapper.addEventListener("click", () => {
    dropdown.toggle();
  });

  editor.on("selectionUpdate", render);
  editor.on("transaction", render);

  render();

  const destroy = () => {
    editor.off("selectionUpdate", render);
    editor.off("transaction", render);
    dropdown.destroy();
  };

  (
    wrapper as typeof wrapper & {
      destroy?: () => void;
    }
  ).destroy = destroy;

  return wrapper;
}

/**
 * Select 下拉工具栏配置项 / Configuration options for a Select dropdown toolbar
 */
export interface SelectToolbarOptions {
  /**
   * 编辑器实例 / The editor instance
   */
  editor: Editor;
  /**
   * 下拉选项列表 / Dropdown option list
   */
  options: SelectOption[];
  /**
   * 提示文本 / The tooltip text
   */
  tooltip: string;
  /**
   * 触发器宽度 / Trigger width
   */
  width?: string;
  /**
   * 下拉面板宽度 / Dropdown panel width
   */
  dropdownWidth?: string;
  /**
   * 获取当前值的函数 / Function to get the current value
   */
  getValue: () => string | number | null;
  /**
   * 值变化回调 / Value change callback
   */
  onChange: (value: string | number | null) => void;
}

/**
 * 创建 Select 下拉工具栏 / Creates a Select dropdown toolbar
 *
 * 统一处理：选项渲染、值同步、编辑器状态监听
 * Handles uniformly: option rendering, value synchronization, editor state listening
 *
 * @param options 配置项 / Configuration options
 * @returns Select 工具栏元素 / Select toolbar element
 */
export function createSelectToolbar(
  options: SelectToolbarOptions,
): HTMLElement {
  const {
    editor,
    options: selectOptions,
    tooltip,
    width,
    dropdownWidth,
    getValue,
    onChange,
  } = options;

  const select = new Select({
    width: width ?? "auto",
    dropdownWidth: dropdownWidth ?? "72px",
    value: null,
    options: selectOptions,
    tooltip,
    onChange(value) {
      onChange(value);
    },
  });

  const sync = () => {
    select.setValue(getValue());
  };

  editor.on("selectionUpdate", sync);
  editor.on("transaction", sync);

  sync();

  return select.el;
}
