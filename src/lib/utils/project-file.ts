import { fileApi } from "@/lib/api/file.api";
import type { ProjectFilePreviewItem } from "@/types/project-file.types";

export function canPreviewProjectFile(file: ProjectFilePreviewItem): boolean {
  return file.mimeType === "application/pdf" || ["image/jpeg", "image/png", "image/webp"].includes(file.mimeType);
}

export function openProjectFile(file: ProjectFilePreviewItem, openPreview: (item: ProjectFilePreviewItem) => void): void {
  if (canPreviewProjectFile(file)) {
    openPreview(file);
    return;
  }
  void fileApi.openContent(file.contentPath);
}
