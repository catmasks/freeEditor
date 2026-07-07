import type { Editor } from "@tiptap/core";

import { FloatingToolbar, type FloatingPlacement } from "../../ui/index";

import { i18n } from "../../core/utils/index";

/**
 * 选区范围类型 / Selection range type
 */
type SelectionRange = {
  from: number;

  to: number;
} | null;

/**
 * 链接对话框选项 / Link dialog options
 */
export interface LinkDialogOptions {
  /**
   * 编辑器实例 / Editor instance
   */
  editor: Editor;

  /**
   * 工具栏按钮目标元素 / Toolbar button target element
   */
  target: HTMLElement;

  /**
   * 弹出位置 / Floating placement
   */
  placement?: FloatingPlacement;
}

/**
 * 链接对话框类 / Link dialog class
 *
 * 用于创建和管理链接的插入、编辑和移除 / Used to create and manage link insertion, editing, and removal
 */
export class LinkDialog {
  /**
   * 编辑器实例 / Editor instance
   */
  private editor: Editor;

  /**
   * 工具栏目标元素 / Toolbar target element
   */
  private toolbarTarget: HTMLElement;

  /**
   * 浮动工具栏实例 / Floating toolbar instance
   */
  private floating: FloatingToolbar;

  /**
   * 保存的选区范围 / Saved selection range
   */
  private selectionRange: SelectionRange = null;

  /**
   * 对话框根元素 / Dialog root element
   */
  private root: HTMLDivElement;

  /**
   * 文本输入框 / Text input
   */
  private textInput: HTMLInputElement;

  /**
   * URL 输入框 / URL input
   */
  private urlInput: HTMLInputElement;

  /**
   * 移除按钮 / Remove button
   */
  private removeButton: HTMLButtonElement;

  /**
   * 构造函数 / Constructor
   *
   * @param options 对话框选项 / Dialog options
   */
  constructor(options: LinkDialogOptions) {
    this.editor = options.editor;

    this.toolbarTarget = options.target;

    this.root = document.createElement("div");

    this.root.className = "free-editor__button free-editor__link-dialog";

    const textRow = document.createElement("div");

    textRow.className = "free-editor__link-dialog__row";

    const textLabel = document.createElement("label");

    textLabel.textContent = i18n.t("link.linkText");

    this.textInput = document.createElement("input");

    this.textInput.placeholder = i18n.t("link.linkTextPlaceholder");

    textRow.append(textLabel, this.textInput);

    const urlRow = document.createElement("div");

    urlRow.className = "free-editor__link-dialog__row";

    const urlLabel = document.createElement("label");

    urlLabel.textContent = i18n.t("link.linkUrl");

    this.urlInput = document.createElement("input");

    this.urlInput.placeholder = i18n.t("link.linkUrlPlaceholder");

    urlRow.append(urlLabel, this.urlInput);

    const actions = document.createElement("div");

    actions.className = "free-editor__link-dialog__actions";

    const confirmButton = document.createElement("button");

    confirmButton.setAttribute("primary", "");

    confirmButton.textContent = i18n.t("common.confirm");

    this.removeButton = document.createElement("button");

    this.removeButton.setAttribute("danger", "");

    this.removeButton.textContent = i18n.t("link.removeLink");

    const cancelButton = document.createElement("button");

    cancelButton.setAttribute("info", "");

    cancelButton.textContent = i18n.t("common.cancel");

    actions.append(confirmButton, this.removeButton, cancelButton);

    this.root.append(textRow, urlRow, actions);

    this.floating = new FloatingToolbar({
      target: this.toolbarTarget,

      placement: options.placement ?? "bottom-center",

      content: this.root,
    });

    confirmButton.addEventListener("click", this.confirm);

    this.removeButton.addEventListener("click", this.remove);

    cancelButton.addEventListener("click", this.close);

    this.textInput.addEventListener("keydown", this.onKeydown);

    this.urlInput.addEventListener("keydown", this.onKeydown);
  }

  /**
   * 键盘按下事件处理 / Keydown event handler
   *
   * @param event 键盘事件 / Keyboard event
   */
  private onKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      this.confirm();
    }
  };

  /**
   * 校验安全链接 / Validate safe href
   *
   * @param href 链接地址 / Link href
   * @returns 是否为安全链接 / Whether it is a safe link
   */
  private isSafeHref(href: string): boolean {
    return /^(https?:\/\/|mailto:|tel:)/i.test(href);
  }

  /**
   * 恢复编辑器选区 / Restore editor selection
   *
   * @returns 是否恢复成功 / Whether restoration was successful
   */
  private restoreSelection(): boolean {
    if (!this.selectionRange) {
      return false;
    }

    this.editor
      .chain()
      .focus()
      .setTextSelection({
        from: this.selectionRange.from,
        to: this.selectionRange.to,
      })
      .run();

    return true;
  }

  /**
   * 打开对话框 / Open dialog
   */
  open(): void {
    if (this.editor.isActive("link")) {
      this.editor.commands.extendMarkRange("link");

      const { from, to } = this.editor.state.selection;

      this.selectionRange = {
        from,
        to,
      };

      this.textInput.value = this.editor.state.doc.textBetween(from, to, " ");

      this.urlInput.value = this.editor.getAttributes("link").href || "";
    } else {
      const { from, to } = this.editor.state.selection;

      this.selectionRange = {
        from,
        to,
      };

      this.textInput.value = this.editor.state.doc.textBetween(from, to, " ");

      this.urlInput.value = "";
    }

    this.removeButton.disabled = !this.editor.isActive("link");

    this.floating.show();

    requestAnimationFrame(() => {
      if (this.textInput.value.trim()) {
        this.urlInput.focus();

        this.urlInput.select();

        return;
      }

      this.textInput.focus();
    });
  }

  /**
   * 关闭对话框 / Close dialog
   */
  close = (): void => {
    this.floating.hide();

    this.selectionRange = null;

    this.textInput.value = "";

    this.urlInput.value = "";
  };

  /**
   * 确认操作 / Confirm action
   *
   * 插入或更新链接 / Insert or update link
   */
  confirm = (): void => {
    if (!this.restoreSelection()) {
      return;
    }

    const text = this.textInput.value.trim();

    let url = this.urlInput.value.trim();

    if (!url) {
      this.editor.commands.unsetLink();

      this.close();

      return;
    }

    if (!/^(https?:\/\/|mailto:|tel:)/i.test(url)) {
      url = `https://${url}`;
    }

    if (!this.isSafeHref(url)) {
      throw new Error(i18n.t("link.unsafeLink") + ": " + url);
    }

    const displayText = text || url;

    const { from, to } = this.editor.state.selection;

    this.editor
      .chain()
      .focus()
      .deleteRange({
        from,
        to,
      })
      .insertContentAt(from, {
        type: "text",

        text: displayText,

        marks: [
          {
            type: "link",

            attrs: {
              href: url,

              target: "_blank",

              rel: "noopener noreferrer nofollow",
            },
          },
        ],
      })
      .setTextSelection(from + displayText.length)
      .run();

    this.close();
  };

  /**
   * 移除链接 / Remove link
   *
   * 移除当前选区的链接 / Remove link from current selection
   */
  remove = (): void => {
    if (!this.restoreSelection()) {
      return;
    }

    this.editor.commands.unsetLink();

    const { to } = this.editor.state.selection;

    this.editor.commands.setTextSelection(to);

    this.close();
  };

  /**
   * 销毁对话框 / Destroy dialog
   *
   * 清理资源和事件监听 / Clean up resources and event listeners
   */
  destroy(): void {
    this.floating.destroy();
  }
}
