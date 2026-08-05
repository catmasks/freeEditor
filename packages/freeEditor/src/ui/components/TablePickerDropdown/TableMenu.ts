import type { Editor } from "@tiptap/core";
import { i18n } from "../../../core";

/**
 * 表格操作项
 */
interface TableMenuItem {
  label: string;
  icon?: string;
  command: (editor: Editor) => void;
  danger?: boolean;
}

/**
 * 创建表格操作菜单
 * @param editor 编辑器实例
 * @returns 菜单 DOM 元素
 */
export function createTableMenu(editor: Editor): HTMLElement {
  const root = document.createElement("div");
  root.className = "free-editor__table-menu";

  const items: TableMenuItem[] = [
    {
      label: i18n.t("table.addRowBefore"),
      command: (e) => e.commands.addTableRowBefore(),
    },
    {
      label: i18n.t("table.addRowAfter"),
      command: (e) => e.commands.addTableRowAfter(),
    },
    {
      label: i18n.t("table.deleteRow"),
      command: (e) => e.commands.deleteTableRow(),
      danger: true,
    },
    {
      label: i18n.t("table.addColumnBefore"),
      command: (e) => e.commands.addTableColumnBefore(),
    },
    {
      label: i18n.t("table.addColumnAfter"),
      command: (e) => e.commands.addTableColumnAfter(),
    },
    {
      label: i18n.t("table.deleteColumn"),
      command: (e) => e.commands.deleteTableColumn(),
      danger: true,
    },
    {
      label: i18n.t("table.toggleHeaderRow"),
      command: (e) => e.commands.toggleHeaderRow(),
    },
    {
      label: i18n.t("table.toggleHeaderColumn"),
      command: (e) => e.commands.toggleHeaderColumn(),
    },
    {
      label: i18n.t("table.deleteTable"),
      command: (e) => e.commands.deleteTable(),
      danger: true,
    },
  ];

  items.forEach((item, index) => {
    // 添加分割线
    if (index > 0 && (index === 3 || index === 6 || index === 8)) {
      const divider = document.createElement("div");
      divider.className = "free-editor__table-menu-divider";
      root.appendChild(divider);
    }

    const button = document.createElement("button");
    button.className = "free-editor__table-menu-item";
    if (item.danger) {
      button.classList.add("is-danger");
    }
    button.textContent = item.label;

    button.addEventListener("click", () => {
      item.command(editor);
      // 触发自定义事件通知外部关闭
      root.dispatchEvent(new CustomEvent("close"));
    });

    root.appendChild(button);
  });

  return root;
}
