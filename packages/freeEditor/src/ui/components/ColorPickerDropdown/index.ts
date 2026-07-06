import { FloatingToolbar, type FloatingPlacement } from "../FloatingToolbar";
import { hexToHsv, hsvToHex } from "./color";

/**
 * HSV 颜色对象 / HSV color object
 */
interface HSVColor {
  h: number;
  s: number;
  v: number;
}

/**
 * 颜色选择器下拉选项 / Color picker dropdown options
 */
export interface ColorPickerDropdownOptions {
  /** 目标元素 / Target element */
  target: HTMLElement;
  /** 当前颜色值 / Current color value */
  value?: string | null;
  /** 弹出位置 / Placement position */
  placement?: FloatingPlacement;
  /** 偏移量 / Offset value */
  offset?: number;
  /** 颜色变化回调 / Color change callback */
  onChange?: (color: string | null) => void;
}

/**
 * 颜色选择器下拉组件 / Color picker dropdown component
 */
export class ColorPickerDropdown {
  /**
   * 默认颜色 / Default color
   */
  private static readonly DEFAULT_COLOR = "#ff0000";

  /**
   * 预设颜色列表 / Preset color list
   */
  private static readonly PRESET_COLORS = [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#ff4d4f",
    "#fa8c16",
    "#fadb14",
    "#52c41a",
    "#1677ff",
    "#722ed1",
  ];

  /**
   * 当前颜色值 / Current color value
   */
  private value: string | null;

  /**
   * 浮动工具栏实例 / Floating toolbar instance
   */
  private floating: FloatingToolbar;

  /**
   * 根容器元素 / Root container element
   */
  private root: HTMLDivElement;

  /**
   * 饱和度明度选择器 / Saturation-value picker
   */
  private sv: HTMLDivElement;

  /**
   * 饱和度明度选择器光标 / Saturation-value picker cursor
   */
  private svCursor: HTMLDivElement;

  /**
   * 色相选择器 / Hue picker
   */
  private hue: HTMLDivElement;

  /**
   * 色相选择器光标 / Hue picker cursor
   */
  private hueCursor: HTMLDivElement;

  /**
   * 预览颜色元素 / Preview color element
   */
  private previewColor: HTMLSpanElement;

  /**
   * 预览文本元素 / Preview text element
   */
  private previewText: HTMLElement;

  /**
   * 颜色变化回调 / Color change callback
   */
  private onChange?: (color: string | null) => void;

  /**
   * 构造函数 / Constructor
   * @param options - 颜色选择器选项 / Color picker options
   */
  constructor(options: ColorPickerDropdownOptions) {
    this.value = options.value ?? null;
    this.onChange = options.onChange;

    this.root = document.createElement("div");
    this.root.className = "free-editor__cp-panel";

    this.sv = document.createElement("div");
    this.sv.className = "free-editor__cp-sv";

    this.svCursor = document.createElement("div");
    this.svCursor.className = "free-editor__cp-cursor";
    this.sv.append(this.svCursor);

    this.hue = document.createElement("div");
    this.hue.className = "free-editor__cp-hue";

    this.hueCursor = document.createElement("div");
    this.hueCursor.className = "free-editor__cp-hue-cursor";
    this.hue.append(this.hueCursor);

    const preview = document.createElement("div");
    preview.className = "free-editor__cp-preview free-editor__button";

    this.previewColor = document.createElement("span");
    this.previewColor.className = "free-editor__cp-preview-color";

    this.previewText = document.createElement("code");

    const clearButton = document.createElement("button");
    clearButton.className = "free-editor__button free-editor__cp-clear";
    clearButton.type = "button";
    clearButton.setAttribute("info", "");
    clearButton.textContent = "清 除";

    preview.append(this.previewColor, this.previewText, clearButton);

    const presets = document.createElement("div");
    presets.className = "free-editor__cp-presets";

    ColorPickerDropdown.PRESET_COLORS.forEach((color) => {
      const item = document.createElement("span");
      item.style.background = color;

      item.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        this.emitChange(color);
      });

      presets.append(item);
    });

    this.root.append(this.sv, this.hue, preview, presets);

    this.floating = new FloatingToolbar({
      target: options.target,
      placement: options.placement ?? "bottom-center",
      offset: options.offset ?? 3,
      content: this.root,
    });

    clearButton.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      this.clear();
    });

    this.sv.addEventListener("pointerdown", this.handleSV);
    this.hue.addEventListener("pointerdown", this.handleHue);

    this.render();
  }

  /**
   * 获取当前 HSV 颜色值 / Get current HSV color value
   */
  private get hsv(): HSVColor {
    return hexToHsv(this.value || ColorPickerDropdown.DEFAULT_COLOR);
  }

  /**
   * 设置颜色值 / Set color value
   * @param color - 颜色值 / Color value
   */
  setValue(color: string | null): void {
    this.value = color;
    this.render();
  }

  /**
   * 获取颜色值 / Get color value
   * @returns 当前颜色值 / Current color value
   */
  getValue(): string | null {
    return this.value;
  }

  /**
   * 触发颜色变化事件 / Emit color change event
   * @param color - 颜色值 / Color value
   */
  private emitChange(color: string | null): void {
    this.value = color;
    this.render();
    this.onChange?.(color);
  }

  /**
   * 清除颜色 / Clear color
   */
  clear(): void {
    this.emitChange(null);
  }

  /**
   * 处理饱和度明度选择 / Handle saturation-value selection
   * @param event - 指针事件 / Pointer event
   */
  private handleSV = (event: PointerEvent): void => {
    event.stopPropagation();

    const rect = this.sv.getBoundingClientRect();

    const s = (event.clientX - rect.left) / rect.width;
    const v = 1 - (event.clientY - rect.top) / rect.height;

    const hsv = this.hsv;

    const color = hsvToHex(
      hsv.h,
      Math.max(0, Math.min(1, s)),
      Math.max(0, Math.min(1, v)),
    );

    this.emitChange(color);
  };

  /**
   * 处理色相选择 / Handle hue selection
   * @param event - 指针事件 / Pointer event
   */
  private handleHue = (event: PointerEvent): void => {
    event.stopPropagation();

    const rect = this.hue.getBoundingClientRect();

    const h = ((event.clientX - rect.left) / rect.width) * 360;

    const hsv = this.hsv;

    const color = hsvToHex(Math.max(0, Math.min(360, h)), hsv.s, hsv.v);

    this.emitChange(color);
  };

  /**
   * 渲染颜色选择器 / Render color picker
   */
  private render(): void {
    const hsv = this.hsv;

    this.sv.style.backgroundColor = `hsl(${hsv.h}, 100%, 50%)`;

    this.hueCursor.style.left = `${(hsv.h / 360) * 100}%`;

    this.svCursor.style.left = `${hsv.s * 100}%`;
    this.svCursor.style.top = `${(1 - hsv.v) * 100}%`;

    this.previewColor.style.background = this.value || "transparent";
    this.previewColor.classList.toggle("is-empty", !this.value);

    this.previewText.textContent = this.value || "NONE";
  }

  /**
   * 显示颜色选择器 / Show color picker
   */
  show(): void {
    this.floating.show();
  }

  /**
   * 隐藏颜色选择器 / Hide color picker
   */
  hide(): void {
    this.floating.hide();
  }

  /**
   * 切换显示状态 / Toggle visibility
   */
  toggle(): void {
    if (this.floating.isVisible()) {
      this.floating.hide();
    } else {
      this.floating.show();
    }
  }

  /**
   * 销毁颜色选择器 / Destroy color picker
   */
  destroy(): void {
    this.floating.destroy();
    this.root.remove();
  }
}
