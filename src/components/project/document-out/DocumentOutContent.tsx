"use client";

import { useState, type ChangeEvent } from "react";
import { Calendar, ExternalLink, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteProjectDocumentMutation,
  useProjectDocumentsQuery,
  useProjectDocumentUpload,
} from "@/hooks/project-document.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import {
  getDocumentTypeLabel,
  PROJECT_DOCUMENT_ACCEPT,
  resolveProjectDocumentPermissions,
} from "@/lib/validation/project-document.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { ProjectDocumentItem, ProjectDocumentType } from "@/types/api/project-document.types";
import { ConfirmDeleteDocumentDialog } from "./ConfirmDeleteDocumentDialog";

interface DocumentOutContentProps {
  projectId: string;
}

const DOC_TABS: ProjectDocumentType[] = ["QUOTATION", "BAST", "INVOICE"];

export function DocumentOutContent({ projectId }: DocumentOutContentProps) {
  const role = useAuthStore((state) => state.user?.role);
  const [activeType, setActiveType] = useState<ProjectDocumentType>("QUOTATION");
  const [docToDelete, setDocToDelete] = useState<ProjectDocumentItem | null>(null);

  const projectQuery = useProjectDetailQuery(projectId);
  const { canView, canMutate, isProjectReadOnly } = resolveProjectDocumentPermissions(
    role,
    projectQuery.data,
  );
  const docsQuery = useProjectDocumentsQuery(projectId, { type: activeType }, { enabled: canView });
  const deleteMutation = useDeleteProjectDocumentMutation(projectId, () => setDocToDelete(null));
  const { uploadFiles, isUploading } = useProjectDocumentUpload(projectId);

  if (!canView) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary">
        Dokumen keluar (Quotation, BAST, Invoice) hanya dapat diakses oleh Owner (BR-34).
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
        title="Document Out"
        description={
          isProjectReadOnly
            ? "Project berada di Archive sehingga dokumen keluar bersifat baca saja (BR-12, BR-39)."
            : "Kelola file Quotation, BAST, dan Invoice (PDF, Word, Excel — maks. 5 MB per file, khusus Owner — BR-34)."
        }
        action={
          canMutate ? (
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover">
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" /> Unggah {activeLabel}
                </>
              )}
              <input
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

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
          <Tabs
            value={activeType}
            onValueChange={(val) => setActiveType(val as ProjectDocumentType)}
          >
            <TabsList className="bg-surface-input">
              {DOC_TABS.map((type) => (
                <TabsTrigger key={type} value={type} className="px-4 text-xs">
                  {getDocumentTypeLabel(type)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <span className="font-mono text-xs text-text-muted">
            {docsQuery.data?.length ?? 0} dokumen
          </span>
        </div>

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
            <div className="space-y-2.5">
              {items.map((doc) => (
                <div
                  key={doc.id}
                  className="flex flex-col gap-3 rounded-xl border border-border/80 bg-surface-input/70 p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-text-primary">{doc.fileName}</p>
                        <StatusBadge tone="muted">{getDocumentTypeLabel(doc.type)}</StatusBadge>
                      </div>
                      <p className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Diunggah: {doc.uploadedAt.slice(0, 10)}
                        </span>
                        <span>• {Math.max(1, Math.round(doc.sizeBytes / 1024))} KB</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <a
                      href={doc.viewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-text-primary transition-colors hover:bg-surface-active"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Buka / Unduh
                    </a>
                    {canMutate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-status-danger-fg hover:bg-status-danger-bg/50"
                        onClick={() => setDocToDelete(doc)}
                        title="Hapus permanen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
