import { i18n } from "../../../core";

/**
 * 表格选择器选项
 */
export interface TablePickerOptions {
  /**
   * 最大行数
   * @default 10
   */
  maxRows?: number;

  /**
   * 最大列数
   * @default 10
   */
  maxCols?: number;

  /**
   * 标题
   */
  title?: string;

  /**
   * 未选择时显示的文本
   */
  placeholder?: string;

  /**
   * 选择表格后的回调
   */
  onSelect?: (rows: number, cols: number) => void;
}

/**
 * 创建表格选择器
 *
 * @param options - 表格选择器配置
 * @returns 表格选择器 DOM 元素
 */
export function createTablePicker(
  options: TablePickerOptions = {},
): HTMLElement {
  const {
    maxRows = 10,
    maxCols = 10,
    title = i18n.t("table.default"),
    placeholder = i18n.t("table.placeholder"),
    onSelect,
  } = options;

  /**
   * 当前选中的行
   */
  let selectedRows = 0;

  /**
   * 当前选中的列
   */
  let selectedCols = 0;

  /**
   * 根节点
   */
  const root = document.createElement("div");

  root.className = "free-editor__table-picker";

  /**
   * 标题
   */
  const titleElement = document.createElement("div");

  titleElement.className = "free-editor__table-picker-title";

  const titleText = document.createElement("span");

  titleText.className = "free-editor__table-picker-title-text";

  titleText.textContent = title;

  /**
   * 尺寸显示
   */
  const sizeElement = document.createElement("div");

  sizeElement.className = "free-editor__table-picker-size";

  sizeElement.textContent = placeholder;

  titleElement.appendChild(titleText);

  titleElement.appendChild(sizeElement);

  /**
   * Grid
   */
  const gridElement = document.createElement("div");

  gridElement.className = "free-editor__table-picker-grid";

  /**
   * 单元格集合
   */
  const cells: HTMLDivElement[] = [];

  /**
   * 更新选择状态
   */
  const update = (): void => {
    if (selectedRows && selectedCols) {
      sizeElement.textContent = `${selectedCols} × ${selectedRows}`;
    } else {
      sizeElement.textContent = placeholder;
    }

    for (const cell of cells) {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);

      const active = row <= selectedRows && col <= selectedCols;

      cell.classList.toggle("is-active", active);
    }
  };

  /**
   * 重置选择状态
   */
  const reset = (): void => {
    selectedRows = 0;
    selectedCols = 0;

    update();
  };

  /**
   * 鼠标悬停单元格
   */
  const handleCellMouseEnter = (event: MouseEvent): void => {
    const cell = event.currentTarget as HTMLDivElement;

    selectedRows = Number(cell.dataset.row);
    selectedCols = Number(cell.dataset.col);

    update();
  };

  /**
   * 选择表格
   */
  const handleCellClick = (event: MouseEvent): void => {
    const cell = event.currentTarget as HTMLDivElement;

    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);

    onSelect?.(row, col);
  };

  /**
   * 鼠标离开 Grid
   */
  const handleMouseLeave = (): void => {
    reset();
  };

  /**
   * 创建 Grid
   */
  for (let row = 1; row <= maxRows; row++) {
    const rowElement = document.createElement("div");

    rowElement.className = "free-editor__table-picker-row";

    for (let col = 1; col <= maxCols; col++) {
      const cell = document.createElement("div");

      cell.className = "free-editor__table-picker-cell";

      cell.dataset.row = String(row);

      cell.dataset.col = String(col);

      cell.addEventListener("mouseenter", handleCellMouseEnter);

      cell.addEventListener("click", handleCellClick);

      rowElement.appendChild(cell);

      cells.push(cell);
    }

    gridElement.appendChild(rowElement);
  }

  gridElement.addEventListener("mouseleave", handleMouseLeave);

  root.appendChild(titleElement);

  root.appendChild(gridElement);

  return root;
}
