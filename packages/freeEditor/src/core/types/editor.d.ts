import type { UploadGenerator } from ".";

declare module "@tiptap/core" {
  interface Storage {
    mediaUploader?: UploadGenerator;
  }
}
