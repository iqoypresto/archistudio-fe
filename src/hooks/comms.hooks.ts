import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { commsApi } from "@/lib/api/comms.api";
import { validateCommsAttachmentFile } from "@/lib/validation/comms.validation";
import type {
  CommsAttachmentPayload,
  CommsFilterParams,
  CreateCommsPayload,
  UpdateCommsPayload,
} from "@/types/api/comms.types";

export const COMMS_QUERY_KEY = ["project-comms"] as const;

export function useProjectCommsQuery(
  projectId: string,
  params?: CommsFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...COMMS_QUERY_KEY, projectId, params ?? {}],
    queryFn: () => commsApi.getEntries(projectId, params),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
  });
}

export function useCreateCommsMutation(projectId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommsPayload) => commsApi.createEntry(projectId, payload),
    onSuccess: () => {
      toast.success("Catatan Comms berhasil disimpan.");
      queryClient.invalidateQueries({ queryKey: [...COMMS_QUERY_KEY, projectId] });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menyimpan catatan Comms.");
    },
  });
}

export function useUpdateCommsMutation(projectId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commsId, payload }: { commsId: string; payload: UpdateCommsPayload }) =>
      commsApi.updateEntry(commsId, payload),
    onSuccess: () => {
      toast.success("Catatan Comms berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: [...COMMS_QUERY_KEY, projectId] });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui catatan Comms.");
    },
  });
}

export function useCommsAttachmentUpload(projectId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<CommsAttachmentPayload | null> => {
    const check = validateCommsAttachmentFile(file);
    if (!check.valid) {
      setErrorMessage(check.message);
      return null;
    }
    setErrorMessage(null);
    setIsUploading(true);
    try {
      const signed = await commsApi.signAttachmentUpload({
        projectId,
        fileName: file.name,
        contentType: file.type,
        fileSizeBytes: file.size,
      });
      await commsApi.uploadAttachmentToSignedUrl({
        uploadUrl: signed.uploadUrl,
        file,
        contentType: file.type,
      });
      return {
        storageKey: signed.storageKey,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal mengunggah lampiran.";
      setErrorMessage(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, errorMessage, clearError: () => setErrorMessage(null) };
}
