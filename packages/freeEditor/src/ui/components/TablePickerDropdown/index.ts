import { FloatingToolbar, type FloatingPlacement } from "../FloatingToolbar";
import { createTablePicker } from "./TablePicker";
import { createTableMenu } from "./TableMenu";

/**
 * 表格选择器下拉选项
 */
export interface TablePickerDropdownOptions {
  /** 目标元素 */
  target: HTMLElement;
  /** 弹出位置 */
  placement?: FloatingPlacement;
  /** 偏移量 */
  offset?: number;
  /** 选择回调 */
  onSelect?: (rows: number, cols: number) => void;
}

/**
 * 表格选择器下拉组件
 */
export class TablePickerDropdown {
  /**
   * 浮动工具栏实例
   */
  private floating: FloatingToolbar;

  /**
   * 选择回调
   */
  private onSelect?: (rows: number, cols: number) => void;

  /**
   * 构造函数
   * @param options - 表格选择器选项
   */
  constructor(options: TablePickerDropdownOptions) {
    this.onSelect = options.onSelect;

    const content = createTablePicker({
      onSelect: (rows, cols) => {
        this.onSelect?.(rows, cols);
        this.hide();
      },
    });

    this.floating = new FloatingToolbar({
      target: options.target,
      placement: options.placement ?? "bottom-center",
      offset: options.offset ?? 3,
      content,
    });
  }

  /**
   * 显示
   */
  show(): void {
    this.floating.show();
  }

  /**
   * 隐藏
   */
  hide(): void {
    this.floating.hide();
  }

  /**
   * 切换显示状态
   */
  toggle(): void {
    if (this.floating.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.floating.destroy();
  }
}

export { createTablePicker, createTableMenu };
