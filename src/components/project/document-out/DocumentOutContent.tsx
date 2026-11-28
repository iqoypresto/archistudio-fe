"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { Loader2, Upload } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageInfoDialog } from "@/components/ui/PageInfoDialog";
import { UnderlineTabsBar } from "@/components/ui/UnderlineTabsNav";
import { useDeleteProjectDocumentMutation, useProjectDocumentsQuery, useProjectDocumentUpload } from "@/hooks/project-document.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { getDocumentTypeLabel, PROJECT_DOCUMENT_ACCEPT, resolveProjectDocumentPermissions } from "@/lib/validation/project-document.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { ProjectDocumentItem, ProjectDocumentType } from "@/types/api/project-document.types";
import { ConfirmDeleteDocumentDialog } from "./ConfirmDeleteDocumentDialog";
import { DocumentOutList } from "./DocumentOutList";

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
  const docsQuery = useProjectDocumentsQuery(projectId, undefined, { enabled: canView });
  const deleteMutation = useDeleteProjectDocumentMutation(projectId, () => setDocToDelete(null));
  const { uploadFiles, isUploading } = useProjectDocumentUpload(projectId);

  const allDocs = useMemo(() => docsQuery.data ?? [], [docsQuery.data]);
  const countsByType = useMemo(
    () => ({
      QUOTATION: allDocs.filter((doc) => doc.type === "QUOTATION").length,
      BAST: allDocs.filter((doc) => doc.type === "BAST").length,
      INVOICE: allDocs.filter((doc) => doc.type === "INVOICE").length,
    }),
    [allDocs],
  );
  const visibleDocs = useMemo(
    () => allDocs.filter((doc) => doc.type === activeType),
    [allDocs, activeType],
  );

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
        titleSuffix={
          <PageInfoDialog
            title="Tentang Document Out"
            description={
              isProjectReadOnly
                ? "Proyek berada di Archive sehingga dokumen keluar bersifat baca saja."
                : "Kelola dokumen Quotation, BAST, dan Invoice dalam format PDF, Word, atau Excel (maks. 5 MB/file)."
            }
          />
        }
        action={
          canMutate ? (
            <label className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary-hover focus-within:ring-2 focus-within:ring-ring sm:h-9 sm:w-auto">
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
            count: docsQuery.data ? countsByType[t.value] : undefined,
          }))}
          rightSlot={`${visibleDocs.length} file ${activeLabel}`}
        />

        <AsyncStateView
          isLoading={docsQuery.isLoading}
          isError={docsQuery.isError}
          error={docsQuery.error}
          data={docsQuery.data ? visibleDocs : undefined}
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
            <DocumentOutList items={items} canMutate={canMutate} onDelete={setDocToDelete} />
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
