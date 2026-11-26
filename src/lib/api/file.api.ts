import { api } from "./axios";
import { toast } from "sonner";

export const fileApi = {
  async getContent(contentPath: string): Promise<Blob> {
    const response = await api.get<Blob>(contentPath, { responseType: "blob", timeout: 60_000 });
    return response.data;
  },

  async openContent(contentPath: string): Promise<void> {
    const pendingTab = window.open("about:blank", "_blank");
    try {
      const blob = await fileApi.getContent(contentPath);
      const objectUrl = URL.createObjectURL(blob);
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
