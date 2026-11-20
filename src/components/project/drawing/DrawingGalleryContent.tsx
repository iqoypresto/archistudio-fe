"use client";

import { useState, type ChangeEvent } from "react";
import { Archive, Calendar, Eye, Loader2, Upload } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  useArchiveDrawingMutation,
  useDrawingUpload,
  useProjectDrawingsQuery,
} from "@/hooks/drawing.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { resolveDrawingPermissions } from "@/lib/validation/drawing.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { DrawingDirection, DrawingItem } from "@/types/api/drawing.types";
import { DrawingPreviewModal } from "./DrawingPreviewModal";

interface DrawingGalleryContentProps {
  projectId: string;
}

const DIRECTION_TABS: { value: DrawingDirection; label: string }[] = [
  { value: "IN", label: "Drawing In" },
  { value: "OUT", label: "Drawing Out" },
];

export function DrawingGalleryContent({ projectId }: DrawingGalleryContentProps) {
  const role = useAuthStore((state) => state.user?.role);
  const [direction, setDirection] = useState<DrawingDirection>("IN");
  const [previewItem, setPreviewItem] = useState<DrawingItem | null>(null);

  const projectQuery = useProjectDetailQuery(projectId);
  const { canView, canManage, isProjectReadOnly } = resolveDrawingPermissions(
    role,
    projectQuery.data,
  );

  const drawingsQuery = useProjectDrawingsQuery(
    projectId,
    { direction },
    { enabled: canView },
  );
  const archiveMutation = useArchiveDrawingMutation(projectId);
  const { uploadDrawing, isUploading } = useDrawingUpload(projectId);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    await uploadDrawing(file, direction);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drawing In / Out"
        description={
          canManage
            ? "Galeri gambar acuan project. Unggah gambar JPG/PNG/WebP terkompresi (maks. 4 MB) atau arsipkan gambar lama (BR-32, BR-33)."
            : isProjectReadOnly
              ? "Project berstatus selesai atau arsip sehingga galeri Drawing bersifat baca saja (BR-12, BR-39)."
              : "Galeri gambar acuan project (mode lihat saja untuk Admin dan Supervisor — BR-32)."
        }
        action={
          canManage ? (
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengompresi & Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Unggah Drawing {direction === "IN" ? "In" : "Out"}
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />
            </label>
          ) : undefined
        }
      />

      <div className="flex items-center gap-2 border-b border-border pb-2">
        {DIRECTION_TABS.map((tab) => {
          const active = direction === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setDirection(tab.value)}
              className={`min-h-11 rounded-lg px-4 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <AsyncStateView
        isLoading={drawingsQuery.isLoading}
        isError={drawingsQuery.isError}
        error={drawingsQuery.error}
        data={drawingsQuery.data}
        isEmpty={(items) => items.length === 0}
        onRetry={() => drawingsQuery.refetch()}
        emptyTitle={`Belum ada Drawing ${direction === "IN" ? "In" : "Out"}`}
        emptyDescription={
          canManage
            ? "Unggah gambar JPG, PNG, atau WebP (maks. 4 MB setelah kompresi) agar dapat dilihat tim."
            : "Belum ada gambar Drawing pada kategori ini."
        }
      >
        {(items) => (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="group relative aspect-4/3 w-full overflow-hidden bg-surface-subtle"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.viewUrl}
                    alt={item.fileName}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                    <Eye className="h-3.5 w-3.5" /> Pratinjau
                  </span>
                </button>

                <div className="flex flex-1 flex-col justify-between gap-3 p-3.5">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-text-primary">
                        {item.fileName}
                      </p>
                      <StatusBadge tone="info">{item.direction}</StatusBadge>
                    </div>
                    <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.uploadedAt.slice(0, 10)} •{" "}
                      {Math.max(1, Math.round(item.sizeBytes / 1024))} KB
                    </p>
                  </div>

                  {canManage && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="min-h-11 w-full gap-1.5 text-xs"
                      onClick={() => archiveMutation.mutate(item.id)}
                      disabled={archiveMutation.isPending}
                    >
                      <Archive className="h-3.5 w-3.5" />
                      Arsipkan Drawing
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </AsyncStateView>

      <DrawingPreviewModal drawing={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
}
