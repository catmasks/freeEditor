/**
 * 编辑器预设插件导出 / Editor preset plugin exports
 *
 * 每个插件只导出 XXXPlugin 实例，作为公共 API 白名单
 * 内部实现（Extension、Schema、Toolbar、工具函数等）保持私有
 */

/* ==================== 默认插件（内部扩展，非 EditorPlugin） ==================== */
export {
  CustomDocument,
  CustomParagraph,
  CustomText,
  PlaceholderPlugin,
  FloatingToolbarPlugin,
  ListItem,
  TaskItem,
} from "./defaultPlugin/index";
export type {
  FloatingToolbarItem,
  FloatingToolbarAPI,
  FloatingPlacement,
} from "./defaultPlugin/index";

/* ==================== 功能插件 ==================== */
export { BoldPlugin } from "./fontBold/index";
export { ItalicPlugin } from "./fontItalic/index";
export { HeadingPlugin } from "./heading/index";
export { CodeBlockPlugin } from "./codeBlock/index";
export { FontFamilyPlugin } from "./fontFamily/index";
export { FontSizePlugin } from "./fontSize/index";
export { AlignmentPlugin } from "./alignment/index";
export { LineHeightPlugin } from "./lineHeight/index";
export { LinkPlugin } from "./link/index";
export { FontColorPlugin } from "./fontColor/index";
export { FontHighlightPlugin } from "./fontHighlight/index";
export { ImagePlugin } from "./image/index";
export { VideoPlugin } from "./video/index";
export { AttachmentPlugin } from "./attachment/index";
export { UnderlinePlugin } from "./underline/index";
export { StrikePlugin } from "./strike/index";
export { SuperscriptPlugin } from "./superscript/index";
export { SubscriptPlugin } from "./subscript/index";
export { BulletListPlugin } from "./bulletList/index";
export { OrderedListPlugin } from "./orderedList/index";
export { TaskListPlugin } from "./taskList/index";
export { IndentPlugin } from "./indent/index";
export { OutdentPlugin } from "./outdent/index";
export { LineBreakPlugin } from "./lineBreak/index";
export { BlockquotePlugin } from "./blockquote/index";
export { DividerPlugin } from "./divider/index";
export { InlineCodePlugin } from "./inlineCode/index";
export { FormatPainterPlugin } from "./formatPainter/index";
export { ClearFormatPlugin } from "./clearFormat/index";
export { UndoPlugin } from "./undo/index";
export { RedoPlugin } from "./redo/index";
export { TablePlugin } from "./table/index";
export { MarkdownPlugin } from "./markdown/index";