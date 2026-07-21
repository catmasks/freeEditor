import { TextAlign } from "./extension";

import { createTextAlignToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

export const TextAlignPlugin: EditorPlugin = {
  key: "textAlign",
  extensions: [TextAlign],
  toolbar: createTextAlignToolbar,
};
