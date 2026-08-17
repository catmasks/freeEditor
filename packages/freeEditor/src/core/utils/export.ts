/**
 * 下载文件
 * @param blob 文件内容
 * @param fileName 文件名
 */
export async function downloadFile(
  blob: Blob,
  fileName: string,
): Promise<void> {
  try {
    const [{ default: saveAs }] = await Promise.all([import("file-saver")]);
    saveAs(blob, fileName);
  } catch (error) {
    console.error("[downloadFile] 下载文件失败:", error);
    throw error;
  }
}
