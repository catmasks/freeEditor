import type { Editor } from "@tiptap/core";
import {
  createIcon,
  createToolbarButton,
  FloatingToolbar,
  createTableMenu,
  createTablePicker,
} from "../../ui/index";
import { i18n } from "../../core/index";

/**
 * 表格图标 SVG
 */
const TABLE_ICON = `
  <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="3" x2="21" y1="9" y2="9" />
      <line x1="3" x2="21" y1="15" y2="15" />
      <line x1="9" x2="9" y1="9" y2="21" />
      <line x1="15" x2="15" y1="9" y2="21" />
    </svg>
`;

/**
 * 创建表格工具栏按钮
 *
 * @param editor 编辑器实例
 * @returns 工具栏按钮元素
 */
export function createTableToolbar(editor: Editor) {
  const icon = createIcon(TABLE_ICON);
  const wrapper = createToolbarButton(icon, {
    text: i18n.t("toolbar.table"),
  });

  let floating: FloatingToolbar | null = null;

  const toggleDropdown = () => {
    if (floating && floating.isVisible()) {
      floating.hide();
      return;
    }

    const isInTable = editor.isActive("table");
    const content = isInTable
      ? createTableMenu(editor)
      : createTablePicker({
          onSelect: (rows, cols) => {
            editor.commands.insertTable(rows, cols);
            floating?.hide();
          },
        });

    if (floating) {
      floating.setContent(content);
    } else {
      floating = new FloatingToolbar({
        target: wrapper,
        content,
        placement: "bottom-center",
        offset: 3,
      });
    }

    // 监听菜单点击后的关闭事件
    content.addEventListener("close", () => {
      floating?.hide();
    });

    floating.show();
  };

  wrapper.addEventListener("pointerdown", (event) => {
    event.preventDefault();
  });

  wrapper.addEventListener("click", () => {
    toggleDropdown();
  });

  const render = () => {
    const isActive = editor.isActive("table");
    wrapper.classList.toggle("is-active", isActive);
  };

  editor.on("selectionUpdate", render);
  editor.on("transaction", render);

  render();

  const destroy = () => {
    editor.off("selectionUpdate", render);
    editor.off("transaction", render);
    floating?.destroy();
  };

  (
    wrapper as typeof wrapper & {
      destroy?: () => void;
    }
  ).destroy = destroy;

  return wrapper;
}
