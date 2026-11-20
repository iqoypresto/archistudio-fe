import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectDocumentApi } from "@/lib/api/project-document.api";
import {
  getDocumentTypeLabel,
  validateProjectDocumentFile,
} from "@/lib/validation/project-document.validation";
import type {
  ProjectDocumentFilterParams,
  ProjectDocumentType,
} from "@/types/api/project-document.types";

export const PROJECT_DOCUMENTS_QUERY_KEY = ["project-documents"] as const;

export function useProjectDocumentsQuery(
  projectId: string,
  params?: ProjectDocumentFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...PROJECT_DOCUMENTS_QUERY_KEY, projectId, params ?? {}],
    queryFn: () => projectDocumentApi.getDocuments(projectId, params),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
  });
}

export function useDeleteProjectDocumentMutation(
  projectId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => projectDocumentApi.deleteDocument(documentId),
    onSuccess: () => {
      toast.success("Dokumen berhasil dihapus permanen.");
      queryClient.invalidateQueries({ queryKey: [...PROJECT_DOCUMENTS_QUERY_KEY, projectId] });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus dokumen.");
    },
  });
}

export function useProjectDocumentUpload(projectId: string) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = async (files: File[], type: ProjectDocumentType): Promise<void> => {
    if (files.length === 0) return;
    setIsUploading(true);
    let successCount = 0;

    try {
      for (const file of files) {
        const check = validateProjectDocumentFile(file);
        if (!check.valid) {
          toast.error(`${file.name}: ${check.message}`);
          continue;
        }
        const signed = await projectDocumentApi.signDocumentUpload({
          projectId,
          type,
          fileName: file.name,
          contentType: file.type,
          fileSizeBytes: file.size,
        });
        await projectDocumentApi.uploadDocumentToSignedUrl({
          uploadUrl: signed.uploadUrl,
          file,
          contentType: file.type,
        });
        await projectDocumentApi.createDocument(projectId, {
          type,
          storageKey: signed.storageKey,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        });
        successCount += 1;
      }

      if (successCount > 0) {
        toast.success(`${successCount} file ${getDocumentTypeLabel(type)} berhasil diunggah.`);
        queryClient.invalidateQueries({ queryKey: [...PROJECT_DOCUMENTS_QUERY_KEY, projectId] });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal mengunggah dokumen.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFiles, isUploading };
}
