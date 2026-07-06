/**
 * 媒体节点属性 / Media node attributes
 */
export interface MediaNodeAttrs {
  /**
   * 节点 ID / Node ID
   */
  id?: string;

  /**
   * 资源地址 / Resource URL
   */
  src?: string;

  /**
   * 文件名称 / File name
   */
  name?: string;

  /**
   * 媒体类型 / Media type
   */
  type?: "image" | "video";

  /**
   * 宽度 / Width
   */
  width?: string;

  /**
   * 高度 / Height
   */
  height?: string;

  /**
   * 是否加载中 / Whether loading
   */
  loading?: boolean;

  /**
   * 是否出错 / Whether error occurred
   */
  error?: boolean;

  /**
   * 上传进度 / Upload progress
   */
  progress?: number;
}
