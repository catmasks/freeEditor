import { Extension } from "@tiptap/core";

/**
 * 获取当前 tableRow
 */
function getCurrentRow($from: any): { node: unknown; depth: number } | null {
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);

    if (node.type.name === "tableRow") {
      return {
        node,

        depth,
      };
    }
  }

  return null;
}

/**
 * 获取当前 table
 */
function getCurrentTable($from: any): { node: unknown; depth: number } | null {
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);

    if (node.type.name === "table") {
      return {
        node,

        depth,
      };
    }
  }

  return null;
}

/**
 * 获取当前 cell
 */
function getCurrentCell($from: any): { node: unknown; depth: number } | null {
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);

    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      return {
        node,

        depth,
      };
    }
  }

  return null;
}

/**
 * 获取当前列索引
 */
function getColumnIndex($from: any): number {
  const row = getCurrentRow($from) as any;

  if (!row) {
    return -1;
  }

  let columnIndex = 0;
  let found = false;

  row.node.forEach((node: any, offset: number, index: number) => {
    if (found) return;

    const cellPos = $from.start(row.depth) + offset;

    if ($from.pos >= cellPos && $from.pos <= cellPos + node.nodeSize) {
      columnIndex = index;
      found = true;
    }
  });

  return columnIndex;
}

/**
 * 创建空单元格
 */
function createEmptyCell(schema: any, type?: any): any {
  const cellType = type || schema.nodes.tableCell;

  return cellType.create(
    {},

    [schema.nodes.paragraph.create()],
  );
}

/**
 * 表格命令
 */
export const TableCommands = Extension.create({
  name: "tableCommands",

  addCommands() {
    return {
      /**
       * 插入表格
       */
      insertTable:
        (rows = 3, cols = 3) =>
        ({ commands }): boolean => {
          const table = {
            type: "table",

            content: Array.from({
              length: rows,
            }).map((_, rowIndex) => ({
              type: "tableRow",

              content: Array.from({
                length: cols,
              }).map(() => ({
                type: rowIndex === 0 ? "tableHeader" : "tableCell",

                attrs: {
                  colspan: 1,
                  rowspan: 1,
                },

                content: [
                  {
                    type: "paragraph",
                  },
                ],
              })),
            })),
          };

          return commands.insertContent([table]);
        },

      /**
       * 删除表格
       */
      deleteTable:
        () =>
        ({ state, dispatch }): boolean => {
          const { $from } = state.selection;

          const table = getCurrentTable($from);

          if (!table) {
            return false;
          }

          const from = $from.before(table.depth);

          const to = $from.after(table.depth);

          dispatch?.(state.tr.delete(from, to));

          return true;
        },

      /**
       * 新增行（后）
       */
      addTableRowAfter:
        () =>
        ({ state, dispatch }): boolean => {
          const { $from } = state.selection;

          const row = getCurrentRow($from) as any;

          if (!row) {
            return false;
          }

          /**
           * 创建新行
           */
          const newRow = row.node.type.create(
            row.node.attrs,

            row.node.content.content.map((cell: any) => {
              return cell.type.create(
                cell.attrs,

                cell.content,
              );
            }),
          );

          const pos = $from.after(row.depth);

          dispatch?.(state.tr.insert(pos, newRow));

          return true;
        },

      /**
       * 新增行（前）
       */
      addTableRowBefore:
        () =>
        ({ state, dispatch }): boolean => {
          const { $from } = state.selection;

          const row = getCurrentRow($from) as any;

          if (!row) {
            return false;
          }

          const newRow = row.node.type.create(
            row.node.attrs,

            row.node.content.content.map((cell: any) => {
              return cell.type.create(
                cell.attrs,

                cell.content,
              );
            }),
          );

          const pos = $from.before(row.depth);

          dispatch?.(state.tr.insert(pos, newRow));

          return true;
        },

      /**
       * 删除当前行
       */
      deleteTableRow:
        () =>
        ({ state, dispatch }): boolean => {
          const { $from } = state.selection;

          const row = getCurrentRow($from);

          if (!row) {
            return false;
          }

          const from = $from.before(row.depth);

          const to = $from.after(row.depth);

          dispatch?.(state.tr.delete(from, to));

          return true;
        },

      /**
       * 新增列（后）
       */
      addTableColumnAfter:
        () =>
        ({ state, dispatch }): boolean => {
          const { schema, tr } = state;
          const { $from } = state.selection;
          const table = getCurrentTable($from) as any;
          const cell = getCurrentCell($from) as any;
          const row = getCurrentRow($from) as any;

          if (!table || !cell || !row) {
            return false;
          }

          const columnIndex = getColumnIndex($from);
          if (columnIndex === -1) {
            return false;
          }

          const tableStart = $from.start(table.depth);
          let addedSize = 0;

          table.node.forEach((rowNode: any, rowOffset: number) => {
            rowNode.forEach(
              (cellNode: any, cellOffset: number, index: number) => {
                if (index === columnIndex) {
                  const pos =
                    tableStart + rowOffset + 1 + cellOffset + cellNode.nodeSize;
                  const type = cellNode.type;

                  tr.insert(pos + addedSize, createEmptyCell(schema, type));
                  addedSize += createEmptyCell(schema, type).nodeSize;
                }
              },
            );
          });

          dispatch?.(tr);

          return true;
        },

      /**
       * 新增列（前）
       */
      addTableColumnBefore:
        () =>
        ({ state, dispatch }): boolean => {
          const { schema, tr } = state;
          const { $from } = state.selection;
          const table = getCurrentTable($from) as any;
          const cell = getCurrentCell($from) as any;
          const row = getCurrentRow($from) as any;

          if (!table || !cell || !row) {
            return false;
          }

          const columnIndex = getColumnIndex($from);
          if (columnIndex === -1) {
            return false;
          }

          const tableStart = $from.start(table.depth);
          let addedSize = 0;

          table.node.forEach((rowNode: any, rowOffset: number) => {
            rowNode.forEach(
              (cellNode: any, cellOffset: number, index: number) => {
                if (index === columnIndex) {
                  const pos = tableStart + rowOffset + 1 + cellOffset;
                  const type = cellNode.type;

                  tr.insert(pos + addedSize, createEmptyCell(schema, type));
                  addedSize += createEmptyCell(schema, type).nodeSize;
                }
              },
            );
          });

          dispatch?.(tr);

          return true;
        },

      /**
       * 删除列
       */
      deleteTableColumn:
        () =>
        ({ state, dispatch }): boolean => {
          const { tr } = state;
          const { $from } = state.selection;
          const table = getCurrentTable($from) as any;
          const cell = getCurrentCell($from) as any;
          const row = getCurrentRow($from) as any;

          if (!table || !cell || !row) {
            return false;
          }

          const columnIndex = getColumnIndex($from);
          if (columnIndex === -1) {
            return false;
          }

          const tableStart = $from.start(table.depth);
          let deletedSize = 0;

          table.node.forEach((rowNode: any, rowOffset: number) => {
            rowNode.forEach(
              (cellNode: any, cellOffset: number, index: number) => {
                if (index === columnIndex) {
                  const pos = tableStart + rowOffset + 1 + cellOffset;

                  tr.delete(
                    pos - deletedSize,
                    pos + cellNode.nodeSize - deletedSize,
                  );
                  deletedSize += cellNode.nodeSize;
                }
              },
            );
          });

          dispatch?.(tr);

          return true;
        },

      /**
       * 切换表头行
       */
      toggleHeaderRow:
        () =>
        ({ state, dispatch }): boolean => {
          const { tr } = state;
          const { $from } = state.selection;
          const table = getCurrentTable($from) as any;
          const row = getCurrentRow($from) as any;

          if (!table || !row) {
            return false;
          }

          const isHeader =
            row.node.content.firstChild?.type.name === "tableHeader";
          const targetType = isHeader
            ? state.schema.nodes.tableCell
            : state.schema.nodes.tableHeader;

          const offset = $from.before(row.depth);

          row.node.forEach((cell: any, cellOffset: number) => {
            const pos = offset + cellOffset + 1;
            tr.setNodeMarkup(pos, targetType, cell.attrs);
          });

          dispatch?.(tr);
          return true;
        },

      /**
       * 切换表头列
       */
      toggleHeaderColumn:
        () =>
        ({ state, dispatch }): boolean => {
          const { tr } = state;
          const { $from } = state.selection;
          const table = getCurrentTable($from) as any;
          const cell = getCurrentCell($from) as any;
          const row = getCurrentRow($from) as any;

          if (!table || !cell || !row) {
            return false;
          }

          // 计算当前列 index
          let columnIndex = 0;
          row.node.forEach((node: any, offset: number, index: number) => {
            const pos = $from.pos;
            const cellPos = $from.start(row.depth) + offset + 1;
            if (pos >= cellPos && pos <= cellPos + node.nodeSize) {
              columnIndex = index;
            }
          });

          const isHeader = cell.node.type.name === "tableHeader";
          const targetType = isHeader
            ? state.schema.nodes.tableCell
            : state.schema.nodes.tableHeader;

          let tableOffset = $from.start(table.depth);
          table.node.forEach((rowNode: any) => {
            rowNode.forEach((cellNode: any, offset: number, index: number) => {
              if (index === columnIndex) {
                const pos = tableOffset + offset + 1;
                tr.setNodeMarkup(pos, targetType, cellNode.attrs);
              }
            });
            tableOffset += rowNode.nodeSize;
          });

          dispatch?.(tr);
          return true;
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tableCommands: {
      /**
       * 插入表格
       */
      insertTable: (rows?: number, cols?: number) => ReturnType;

      /**
       * 删除表格
       */
      deleteTable: () => ReturnType;

      /**
       * 新增行（前）
       */
      addTableRowBefore: () => ReturnType;

      /**
       * 新增行（后）
       */
      addTableRowAfter: () => ReturnType;

      /**
       * 删除行
       */
      deleteTableRow: () => ReturnType;

      /**
       * 新增列（前）
       */
      addTableColumnBefore: () => ReturnType;

      /**
       * 新增列（后）
       */
      addTableColumnAfter: () => ReturnType;

      /**
       * 删除列
       */
      deleteTableColumn: () => ReturnType;

      /**
       * 切换表头行
       */
      toggleHeaderRow: () => ReturnType;

      /**
       * 切换表头列
       */
      toggleHeaderColumn: () => ReturnType;
    };
  }
}
