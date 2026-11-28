"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { useStoredFileUrl } from "@/hooks/use-stored-file-url.hooks";
import type { ProjectFilePreviewItem } from "@/types/project-file.types";

export function ImageDocumentCanvas({ file, zoom }: { file: ProjectFilePreviewItem; zoom: number }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const { src: storedSrc, isLoading, isError } = useStoredFileUrl(file.contentPath, {
    enabled: !file.blob && Boolean(file.contentPath),
  });

  useEffect(() => {
    if (!file.blob) return;
    const url = URL.createObjectURL(file.blob);
    const frame = requestAnimationFrame(() => setBlobUrl(url));
    return () => {
      cancelAnimationFrame(frame);
      URL.revokeObjectURL(url);
    };
  }, [file.blob]);

  const src = file.blob ? blobUrl : storedSrc;
  const loading = file.blob ? !blobUrl : isLoading;

  if (loading) return <ViewerMessage><LoaderCircle className="size-5 animate-spin" /> Memuat gambar…</ViewerMessage>;
  if ((!file.blob && isError) || !src) return <ViewerMessage role="alert">Gambar tidak dapat dimuat. Periksa koneksi lalu coba lagi.</ViewerMessage>;

  return (
    <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={file.fileName} className="max-w-none bg-white object-contain shadow-xl"
        style={{ maxWidth: `${zoom * 100}%`, maxHeight: `${zoom * 100}%` }} />
    </div>
  );
}

function ViewerMessage({ children, role }: { children: ReactNode; role?: "alert" }) {
  return <div role={role} className="flex h-full items-center justify-center gap-2 p-6 text-center text-sm text-white/75">{children}</div>;
}
