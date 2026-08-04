import { Alignment, AlignmentSchema } from "./extension";

import { createAlignmentToolbar } from "./toolbar";
import type { EditorPlugin } from "../../core";

export const AlignmentPlugin: EditorPlugin = {
  key: "alignment",
  schema: [AlignmentSchema],

  extensions: [Alignment],
  toolbar: createAlignmentToolbar,
};
