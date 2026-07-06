import { Node, mergeAttributes } from "@tiptap/core";

import { MediaNodeViewRenderer } from "../../core/index";

/**
 * 视频节点 / Video node
 */
export const CustomVideo = Node.create({
  /**
   * 节点名称 / Node name
   */
  name: "video",

  /**
   * 是否内联节点 / Whether it is an inline node
   */
  inline: true,

  /**
   * 节点分组 / Node group
   */
  group: "inline",

  /**
   * 是否原子节点 / Whether it is an atom node
   */
  atom: true,

  /**
   * 是否允许拖动 / Whether it is draggable
   */
  draggable: true,

  /**
   * 是否允许选中 / Whether it is selectable
   */
  selectable: true,

  /**
   * 节点属性 / Node attributes
   *
   * @returns 属性定义对象 / Attribute definition object
   */
  addAttributes() {
    return {
      ...this.parent?.(),

      /**
       * 媒体类型 / Media type
       */
      type: {
        default: "video",
      },

      /**
       * 视频地址 / Video source URL
       */
      src: {
        default: "",
      },

      /**
       * 宽度 / Width
       */
      width: {
        default: "150px",
      },

      /**
       * 高度 / Height
       */
      height: {
        default: "auto",
      },

      /**
       * 上传任务 ID / Upload task ID
       */
      id: {
        default: null,
      },

      /**
       * 文件名称 / File name
       */
      name: {
        default: "",
      },

      /**
       * 是否上传中 / Whether uploading
       */
      loading: {
        default: false,
      },

      /**
       * 上传进度 / Upload progress
       */
      progress: {
        default: 0,
      },

      /**
       * 是否上传失败 / Whether upload failed
       */
      error: {
        default: false,
      },
    };
  },

  /**
   * 解析 HTML 规则 / Parse HTML rules
   *
   * @returns HTML 解析规则数组 / HTML parse rules array
   */
  parseHTML() {
    return [
      {
        tag: "video[src]",
      },
    ];
  },

  /**
   * 渲染 HTML / Render HTML
   *
   * @param HTMLAttributes HTML 属性 / HTML attributes
   * @returns HTML 渲染描述 / HTML render description
   */
  renderHTML({ HTMLAttributes }) {
    const { width, height, id, name, src } = HTMLAttributes;

    const finalWidth = width || "auto";

    const finalHeight = height || "auto";

    return [
      "video",
      mergeAttributes(
        {
          id,

          src,

          alt: name,

          title: name,
        },

        {
          style: `
            width: ${finalWidth || "auto"};
            height: ${finalHeight || "auto"};
            max-width: 100%;
            display: inline-block;
            cursor: pointer;
          `
            .replace(/\s+/g, " ")
            .trim(),
        },
      ),
    ];
  },

  /**
   * 节点视图 / Node view
   *
   * @returns 节点视图渲染器 / Node view renderer
   */
  addNodeView() {
    return MediaNodeViewRenderer;
  },

  /**
   * 命令集合 / Command collection
   *
   * @returns 命令对象 / Command object
   */
  addCommands() {
    return {
      ...this.parent?.(),

      /**
       * 插入视频 / Insert video
       *
       * @param options 视频选项 / Video options
       * @returns 命令函数 / Command function
       */
      setVideo:
        (options: any) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,

            attrs: options,
          });
        },
    };
  },
});
