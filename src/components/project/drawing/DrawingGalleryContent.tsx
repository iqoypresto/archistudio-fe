"use client";

import { useState, type ChangeEvent } from "react";
import { Archive, Calendar, Eye, Loader2, Upload } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="space-y-5">
      <PageHeader
        title="Drawing In / Out"
        description={
          canManage
            ? "Galeri gambar acuan project. Unggah gambar JPG/PNG/WebP terkompresi (maks. 4 MB) atau arsipkan gambar lama (BR-32, BR-33)."
            : isProjectReadOnly
              ? "Project berstatus selesai atau arsip sehingga galeri Drawing bersifat baca saja (BR-12, BR-39)."
              : role === "SUPERVISOR"
                ? "Gambar acuan project yang dapat Anda lihat."
                : "Galeri gambar acuan project (mode lihat saja untuk Admin — BR-32)."
        }
        action={
          canManage ? (
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Mengompresi &amp; Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Unggah Drawing {direction === "IN" ? "In" : "Out"}
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

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
          <Tabs
            value={direction}
            onValueChange={(val) => setDirection(val as DrawingDirection)}
          >
            <TabsList className="bg-surface-input">
              {DIRECTION_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="min-h-12 px-4 text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <span className="font-mono text-xs text-text-muted">
            {drawingsQuery.data?.length ?? 0} gambar
          </span>
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
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-border/80 bg-surface-input/70 transition-colors hover:border-white/[0.14]"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Pratinjau ${item.fileName}`}
                    onClick={() => setPreviewItem(item)}
                    className="group relative h-auto aspect-4/3 w-full overflow-hidden rounded-none border-0 bg-surface p-0 hover:bg-surface"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.viewUrl}
                      alt={item.fileName}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-[11px] text-white backdrop-blur-xs">
                      <Eye className="h-3 w-3" /> Pratinjau
                    </span>
                  </Button>

                  <div className="flex flex-1 flex-col justify-between gap-3 p-3.5">
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-text-primary">
                          {item.fileName}
                        </p>
                        <StatusBadge tone="info">{item.direction}</StatusBadge>
                      </div>
                      <p className="flex items-center gap-1.5 font-mono text-[11px] text-text-muted">
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
                        className="h-8 w-full gap-1.5 text-xs"
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
      </section>

      <DrawingPreviewModal drawing={previewItem} onClose={() => setPreviewItem(null)} />
    </div>
  );
}
