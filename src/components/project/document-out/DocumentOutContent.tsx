"use client";

import { useState, type ChangeEvent } from "react";
import { ExternalLink, FileText, Loader2, Upload } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UnderlineTabsBar } from "@/components/ui/UnderlineTabsNav";
import { useDeleteProjectDocumentMutation, useProjectDocumentsQuery, useProjectDocumentUpload } from "@/hooks/project-document.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { formatIdDate } from "@/lib/utils/office-format";
import { getDocumentTypeLabel, PROJECT_DOCUMENT_ACCEPT, resolveProjectDocumentPermissions } from "@/lib/validation/project-document.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { ProjectDocumentItem, ProjectDocumentType } from "@/types/api/project-document.types";
import { ConfirmDeleteDocumentDialog } from "./ConfirmDeleteDocumentDialog";

const DOC_TABS: readonly { value: ProjectDocumentType; label: string }[] = [
  { value: "QUOTATION", label: "Quotation" },
  { value: "BAST", label: "BAST" },
  { value: "INVOICE", label: "Invoice" },
];

export function DocumentOutContent({ projectId }: { projectId: string }) {
  const role = useAuthStore((state) => state.user?.role);
  const [activeType, setActiveType] = useState<ProjectDocumentType>("QUOTATION");
  const [docToDelete, setDocToDelete] = useState<ProjectDocumentItem | null>(null);

  const projectQuery = useProjectDetailQuery(projectId);
  const project = projectQuery.data;
  const { canView, canMutate, isProjectReadOnly } = resolveProjectDocumentPermissions(
    role,
    project,
  );
  const docsQuery = useProjectDocumentsQuery(projectId, { type: activeType }, { enabled: canView });
  const deleteMutation = useDeleteProjectDocumentMutation(projectId, () => setDocToDelete(null));
  const { uploadFiles, isUploading } = useProjectDocumentUpload(projectId);

  if (!canView) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary">
        Dokumen keluar (Quotation, BAST, Invoice) hanya dapat diakses oleh Owner.
      </div>
    );
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    await uploadFiles(selected, activeType);
  };
  const activeLabel = getDocumentTypeLabel(activeType);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker={project ? `${project.code} · ${project.name}` : undefined}
        title="Document Out"
        description={
          isProjectReadOnly
            ? "Proyek berada di Archive sehingga dokumen keluar bersifat baca saja."
            : "Kelola dokumen Quotation, BAST, dan Invoice dalam format PDF, Word, atau Excel (maks. 5 MB/file)."
        }
        action={
          canMutate ? (
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-white/15 bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
              {isUploading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" /> Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="size-3.5" /> Unggah {activeLabel}
                </>
              )}
              <Input
                type="file"
                multiple
                accept={PROJECT_DOCUMENT_ACCEPT}
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />
            </label>
          ) : undefined
        }
      />

      <section className="overflow-hidden rounded-xl border border-border bg-surface tabular-nums">
        <UnderlineTabsBar
          ariaLabel="Kategori dokumen keluar"
          activeValue={activeType}
          onChange={setActiveType}
          items={DOC_TABS.map((t) => ({
            ...t,
            count: t.value === activeType ? docsQuery.data?.length : undefined,
          }))}
          rightSlot={`${docsQuery.data?.length ?? 0} file ${activeLabel}`}
        />

        <AsyncStateView
          isLoading={docsQuery.isLoading}
          isError={docsQuery.isError}
          error={docsQuery.error}
          data={docsQuery.data}
          isEmpty={(items) => items.length === 0}
          onRetry={() => docsQuery.refetch()}
          emptyTitle={`Belum ada file ${activeLabel}`}
          emptyDescription={
            canMutate
              ? `Unggah satu atau beberapa file ${activeLabel} (PDF, Word, atau Excel maks. 5 MB/file).`
              : `Kategori ${activeLabel} belum memiliki file.`
          }
        >
          {(items) => (
            <Table>
              <TableHeader className="bg-surface-input/50">
                <TableRow className="border-border/80 hover:bg-transparent">
                  <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
                    Nama Dokumen
                  </TableHead>
                  <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
                    Diunggah &amp; Ukuran
                  </TableHead>
                  <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((doc) => (
                  <TableRow key={doc.id} className="border-border/60 hover:bg-surface-input/40">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <FileText className="size-4 shrink-0 text-text-muted" />
                        <span className="truncate text-[13px] font-medium text-text-primary">
                          {doc.fileName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-text-secondary">
                      {formatIdDate(doc.uploadedAt)} · {Math.max(1, Math.round(doc.sizeBytes / 1024))} KB
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={doc.viewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface-input px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary"
                        >
                          <ExternalLink className="size-3.5" />
                          Buka / Unduh
                        </a>
                        {canMutate && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                            onClick={() => setDocToDelete(doc)}
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AsyncStateView>
      </section>

      {canMutate && (
        <ConfirmDeleteDocumentDialog
          targetDocument={docToDelete}
          onClose={() => setDocToDelete(null)}
          onConfirm={(id) => deleteMutation.mutate(id)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
