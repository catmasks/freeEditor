import type { UploadGenerator, FloatingToolbarAPI, MediaEngine } from ".";

declare module "@tiptap/core" {
  interface Storage {
    mediaUploader?: UploadGenerator;
    floatingToolbar?: FloatingToolbarAPI;
    mediaEngine?: MediaEngine;
  }
}
