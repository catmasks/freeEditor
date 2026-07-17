import type { UploadGenerator, FloatingToolbarAPI } from ".";

declare module "@tiptap/core" {
  interface Storage {
    mediaUploader?: UploadGenerator;
    floatingToolbar?: FloatingToolbarAPI;
  }
}
