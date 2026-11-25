import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { drawingApi } from "@/lib/api/drawing.api";
import {
  validateCompressedDrawingSize,
  validateDrawingFileType,
} from "@/lib/validation/drawing.validation";
import type {
  DrawingFilterParams,
  DrawingMimeType,
} from "@/types/api/drawing.types";

export const DRAWINGS_QUERY_KEY = ["drawings"] as const;

export function useProjectDrawingsQuery(
  projectId: string,
  params?: DrawingFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...DRAWINGS_QUERY_KEY, projectId, params ?? {}],
    queryFn: () => drawingApi.getDrawings(projectId, params),
    enabled: Boolean(projectId) && (options?.enabled ?? true),
  });
}

export function useArchiveDrawingMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (drawingId: string) => drawingApi.archiveDrawing(drawingId),
    onSuccess: () => {
      toast.success("Drawing berhasil diarsipkan.");
      queryClient.invalidateQueries({ queryKey: [...DRAWINGS_QUERY_KEY, projectId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengarsipkan Drawing.");
    },
  });
}

export function useDrawingUpload(projectId: string) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const uploadDrawing = async (file: File): Promise<boolean> => {
    const typeCheck = validateDrawingFileType(file);
    if (!typeCheck.valid) {
      toast.error(typeCheck.message);
      return false;
    }

    setIsUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 3.8,
        maxWidthOrHeight: 2560,
        useWebWorker: true,
        fileType: typeCheck.mimeType,
      });

      const sizeCheck = validateCompressedDrawingSize(compressed.size);
      if (!sizeCheck.valid) {
        toast.error(sizeCheck.message);
        return false;
      }

      const mimeType = (compressed.type || typeCheck.mimeType) as DrawingMimeType;
      const signed = await drawingApi.signDrawingUpload({
        projectId,
        fileName: file.name,
        contentType: mimeType,
        fileSizeBytes: compressed.size,
      });
      await drawingApi.uploadDrawingToSignedUrl({
        uploadUrl: signed.uploadUrl,
        file: compressed,
        contentType: mimeType,
      });
      await drawingApi.createDrawing(projectId, {
        storageKey: signed.storageKey,
        fileName: file.name,
        mimeType,
        sizeBytes: compressed.size,
      });

      toast.success("Drawing berhasil diunggah.");
      queryClient.invalidateQueries({ queryKey: [...DRAWINGS_QUERY_KEY, projectId] });
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Gagal mengunggah Drawing.";
      toast.error(msg);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadDrawing, isUploading };
}
