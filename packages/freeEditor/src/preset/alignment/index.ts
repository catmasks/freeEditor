import { Alignment } from "./extension";

import { createAlignmentToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

export const AlignmentPlugin: EditorPlugin = {
  key: "alignment",
  extensions: [Alignment],
  toolbar: createAlignmentToolbar,
};
