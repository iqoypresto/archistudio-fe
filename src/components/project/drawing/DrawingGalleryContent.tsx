"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Loader2, Search, Upload } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { useArchiveDrawingMutation, useDrawingUpload, useProjectDrawingsQuery } from "@/hooks/drawing.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { formatIdDate } from "@/lib/utils/office-format";
import { isFieldRole } from "@/lib/utils/role";
import { resolveDrawingPermissions } from "@/lib/validation/drawing.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { DrawingItem } from "@/types/api/drawing.types";
import type { ApiSurface } from "@/lib/api/api-surface";
import { ConfirmArchiveDrawingDialog } from "./ConfirmArchiveDrawingDialog";
import { DrawingPreviewModal } from "./DrawingPreviewModal";

export function DrawingGalleryContent({ projectId, surface = "office" }: { projectId: string; surface?: ApiSurface }) {
  const role = useAuthStore((state) => state.user?.role);
  const [search, setSearch] = useState("");
  const [previewItem, setPreviewItem] = useState<DrawingItem | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<DrawingItem | null>(null);

  const projectQuery = useProjectDetailQuery(projectId, surface);
  const project = projectQuery.data;
  const { canView, canManage, isProjectReadOnly } = resolveDrawingPermissions(role, project);

  const drawingsQuery = useProjectDrawingsQuery(projectId, undefined, { enabled: canView }, surface);
  const archiveMutation = useArchiveDrawingMutation(projectId);
  const { uploadDrawing, isUploading } = useDrawingUpload(projectId);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const items = drawingsQuery.data ?? [];
    return q ? items.filter((item) => item.fileName.toLowerCase().includes(q)) : items;
  }, [drawingsQuery.data, search]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await uploadDrawing(file);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        kicker={project ? `${project.code} · ${project.name}` : undefined}
        title="Drawing"
        description={
          canManage
            ? "Galeri gambar desain arsitektur proyek. Unggah file JPG, PNG, atau WebP (maks. 4 MB)."
            : isProjectReadOnly
              ? "Proyek berada di Archive sehingga galeri Drawing bersifat baca saja."
              : isFieldRole(role)
                ? "Gambar desain acuan proyek yang dapat Anda lihat."
                : "Galeri gambar desain arsitektur proyek dalam mode lihat saja."
        }
        action={
          canManage ? (
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
              {isUploading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="size-3.5" />
                  Unggah Drawing
                </>
              )}
              <Input
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

      <section className="overflow-hidden rounded-xl border border-border bg-surface tabular-nums">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama file drawing..."
              className="h-9 pl-8 text-xs"
            />
          </div>
          <span className="text-xs text-text-muted">
            {filteredItems.length} gambar · Klik gambar untuk pratinjau penuh
          </span>
        </div>

        <div className="p-5">
          <AsyncStateView
            isLoading={drawingsQuery.isLoading}
            isError={drawingsQuery.isError}
            error={drawingsQuery.error}
            data={filteredItems}
            isEmpty={(items) => items.length === 0}
            onRetry={() => drawingsQuery.refetch()}
            emptyTitle={search ? "Drawing tidak ditemukan" : "Belum ada Drawing"}
            emptyDescription={
              search
                ? "Coba kata kunci nama file yang berbeda."
                : canManage
                  ? "Unggah gambar desain JPG, PNG, atau WebP (maks. 4 MB) agar dapat diakses tim."
                  : "Belum ada gambar desain Drawing pada proyek ini."
            }
          >
            {(items) => (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface-input/40 transition-colors hover:border-white/15"
                  >
                    <button
                      type="button"
                      aria-label={`Pratinjau ${item.fileName}`}
                      onClick={() => setPreviewItem(item)}
                      className="group relative aspect-4/3 w-full overflow-hidden bg-canvas"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.viewUrl}
                        alt={item.fileName}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                      />
                    </button>

                    <div className="flex items-center justify-between gap-2 p-3.5">
                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-[13px] font-medium text-text-primary">{item.fileName}</p>
                        <p className="text-xs text-text-muted">
                          {formatIdDate(item.uploadedAt)} · {Math.max(1, Math.round(item.sizeBytes / 1024))} KB
                        </p>
                      </div>
                      {canManage && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 shrink-0 px-2.5 text-xs text-text-secondary hover:text-text-primary"
                          onClick={() => setArchiveTarget(item)}
                          disabled={archiveMutation.isPending}
                        >
                          Arsipkan
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </AsyncStateView>
        </div>
      </section>

      <DrawingPreviewModal drawing={previewItem} onClose={() => setPreviewItem(null)} />
      <ConfirmArchiveDrawingDialog
        drawing={archiveTarget}
        onClose={() => setArchiveTarget(null)}
        isSubmitting={archiveMutation.isPending}
        onConfirm={(id) => archiveMutation.mutate(id, { onSuccess: () => setArchiveTarget(null) })}
      />
    </div>
  );
}
