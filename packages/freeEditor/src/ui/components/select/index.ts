import { FloatingToolbar, type FloatingPlacement } from "../FloatingToolbar";

import { createToolbarButton } from "../button";

import { i18n } from "../../../core/utils/index";

/**
 * 选择器选项 / Select option
 */
export interface SelectOption {
  /** 显示标签 / Display label */
  label: string;

  /** 选项值 / Option value */
  value: string | number | null;
}

/**
 * 选择器配置 / Select options
 */
export interface SelectOptions {
  /** 挂载节点 / Mount container */
  container?: HTMLElement;

  /** 选项数据 / Option data */
  options?: SelectOption[];

  /** 当前值 / Current value */
  value?: string | number | null;

  /** 占位文本 / Placeholder text */
  placeholder?: string;

  /** 提示文本 / Tooltip text */
  tooltip?: string;

  /** 触发器宽度 / Trigger width */
  width?: string;

  /** 下拉框宽度 / Dropdown width */
  dropdownWidth?: string;

  /** 最大高度 / Max height */
  maxHeight?: string;

  /** 弹出位置 / Placement position */
  placement?: FloatingPlacement;

  /** 值变化回调 / Value change callback */
  onChange?: (
    value: string | number | null,

    item: SelectOption,
  ) => void;
}

/**
 * 下拉选择器组件 / Select dropdown component
 */
export class Select {
  /**
   * 根元素 / Root element
   */
  public el: HTMLElement;

  /**
   * 触发器元素 / Trigger element
   */
  private triggerEl: HTMLElement;

  /**
   * 值显示元素 / Value display element
   */
  private valueEl: HTMLElement;

  /**
   * 箭头元素 / Arrow element
   */
  private arrowEl: HTMLElement;

  /**
   * 下拉框元素 / Dropdown element
   */
  private dropdownEl: HTMLElement;

  /**
   * 浮动工具栏实例 / Floating toolbar instance
   */
  private floating: FloatingToolbar;

  /**
   * 配置选项 / Configuration options
   */
  private options: Required<SelectOptions>;

  /**
   * 当前值 / Current value
   */
  private value: string | number | null = null;

  /**
   * 是否打开 / Whether it is open
   */
  private open = false;

  /**
   * 构造函数 / Constructor
   * @param options - 选择器选项 / Select options
   */
  constructor(options: SelectOptions = {}) {
    this.options = {
      container: document.body,

      options: [],

      value: null,

      placeholder: i18n.t("common.selectPlaceholder"),

      tooltip: "",

      width: "120px",

      dropdownWidth: "auto",

      maxHeight: "180px",

      placement: "bottom-start",

      onChange: () => {},

      ...options,
    };

    this.value = this.options.value;

    this.el = document.createElement("div");

    this.el.className = "free-select";

    this.el.style.width = this.options.width;

    this.triggerEl = document.createElement("div");

    this.triggerEl.className = "free-select__trigger";

    this.valueEl = document.createElement("div");

    this.valueEl.className = "free-select__value";

    this.arrowEl = document.createElement("div");

    this.arrowEl.className = "free-select__arrow";

    this.arrowEl.innerHTML = `▼`;

    this.triggerEl.appendChild(this.valueEl);

    this.triggerEl.appendChild(this.arrowEl);

    this.el = this.options.tooltip
      ? createToolbarButton(this.triggerEl, this.options.tooltip)
      : this.triggerEl;

    this.el.classList.add("free-select");

    this.el.style.width = this.options.width;

    this.dropdownEl = document.createElement("div");

    this.dropdownEl.className = "free-select__dropdown";

    this.dropdownEl.style.width = this.options.dropdownWidth;

    this.dropdownEl.style.maxHeight = this.options.maxHeight;

    this.floating = new FloatingToolbar({
      target: this.triggerEl,

      placement: this.options.placement,

      content: this.dropdownEl,

      onClose: () => {
        this.setOpen(false);
      },
    });

    this.renderValue();

    this.renderOptions();

    this.bindEvents();

    this.options.container.appendChild(this.el);
  }

  /**
   * 绑定事件 / Bind events
   */
  private bindEvents() {
    this.triggerEl.addEventListener("click", () => {
      this.toggle();
    });
  }

  /**
   * 渲染当前值 / Render current value
   */
  private renderValue() {
    const current = this.options.options.find(
      (item) => item.value === this.value,
    );

    this.valueEl.textContent = current?.label || this.options.placeholder;
  }

  /**
   * 渲染选项 / Render options
   */
  private renderOptions() {
    this.dropdownEl.innerHTML = "";

    if (!this.options.options.length) {
      const empty = document.createElement("div");

      empty.className = "free-select__option free-select__option--empty";

      empty.textContent = i18n.t("common.noOptions");

      this.dropdownEl.appendChild(empty);

      return;
    }

    this.options.options.forEach((item) => {
      const option = document.createElement("div");

      option.className = "free-select__option";

      option.textContent = item.label;

      if (item.value === this.value) {
        option.classList.add("is-active");
      }

      option.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });

      option.addEventListener("click", () => {
        this.setValue(item.value);

        this.options.onChange(item.value, item);

        this.close();
      });

      this.dropdownEl.appendChild(option);
    });
  }

  /**
   * 打开下拉框 / Open dropdown
   */
  async openDropdown() {
    if (this.open) {
      return;
    }

    this.setOpen(true);

    await this.floating.show();
  }

  /**
   * 关闭下拉框 / Close dropdown
   */
  async close() {
    if (!this.open) {
      return;
    }

    this.setOpen(false);

    await this.floating.hide();
  }

  /**
   * 切换下拉框状态 / Toggle dropdown state
   */
  toggle() {
    this.open ? this.close() : this.openDropdown();
  }

  /**
   * 设置打开状态 / Set open state
   * @param state - 打开状态 / Open state
   */
  private setOpen(state: boolean) {
    this.open = state;

    if (state) {
      this.triggerEl.classList.add("is-focus");

      this.arrowEl.classList.add("is-reverse");
    } else {
      this.triggerEl.classList.remove("is-focus");

      this.arrowEl.classList.remove("is-reverse");
    }
  }

  /**
   * 设置值 / Set value
   * @param value - 值 / Value
   */
  setValue(value: string | number | null) {
    this.value = value;

    this.renderValue();

    this.renderOptions();
  }

  /**
   * 获取值 / Get value
   * @returns 当前值 / Current value
   */
  getValue() {
    return this.value;
  }

  /**
   * 设置选项 / Set options
   * @param options - 选项列表 / Option list
   */
  setOptions(options: SelectOption[]) {
    this.options.options = options;

    this.renderValue();

    this.renderOptions();
  }

  /**
   * 销毁选择器 / Destroy select
   */
  destroy() {
    this.floating.destroy();

    this.el.remove();
  }
}
