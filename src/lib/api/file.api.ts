import { api } from "./axios";
import {
  buildStoredFilePath,
  loadStoredFile,
  type CachedStoredFile,
  type StoredFileVariant,
} from "./file-cache";
import { toast } from "sonner";

export const fileApi = {
  async getContent(contentPath: string, variant: StoredFileVariant = "full"): Promise<Blob> {
    const requestPath = buildStoredFilePath(contentPath, variant);
    const response = await api.get<Blob>(requestPath, { responseType: "blob", timeout: 60_000 });
    return response.data;
  },

  getCachedEntry(
    contentPath: string,
    variant: StoredFileVariant = "full",
  ): Promise<CachedStoredFile> {
    return loadStoredFile(contentPath, variant, (requestPath) => fileApi.getContent(requestPath));
  },

  async openContent(contentPath: string): Promise<void> {
    const pendingTab = window.open("about:blank", "_blank");
    try {
      const entry = await fileApi.getCachedEntry(contentPath, "full");
      const objectUrl = URL.createObjectURL(entry.blob);
      if (pendingTab) {
        pendingTab.location.href = objectUrl;
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
        return;
      }
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = "";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch {
      pendingTab?.close();
      toast.error("Gagal membuka file. Coba lagi.");
    }
  },
};
