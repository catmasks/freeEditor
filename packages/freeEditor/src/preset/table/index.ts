import type { EditorPlugin } from "../../core/index";

import { CustomTable } from "./extensions/CustomTable";

import { CustomTableRow } from "./extensions/CustomTableRow";

import { CustomTableCell } from "./extensions/CustomTableCell";

import { TableCommands } from "./extensions/TableCommands";

import { CustomTableHeader } from "./extensions/CustomTableHeader";
import { createTableToolbar } from "./toolbar";

export const TablePlugin: EditorPlugin = {
  key: "table",

  toolbar: createTableToolbar,

  extensions: [
    CustomTable,
    CustomTableRow,
    TableCommands,
    CustomTableCell,
    CustomTableHeader,
  ],
};
