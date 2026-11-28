"use client";

import { useState } from "react";
import { ExternalLink, Eye, FileText } from "lucide-react";
import { ProjectFilePreviewDialog } from "@/components/field/project/ProjectFilePreviewDialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatIdDate } from "@/lib/utils/office-format";
import { canPreviewProjectFile, openProjectFile } from "@/lib/utils/project-file";
import type { ProjectDocumentItem } from "@/types/api/project-document.types";
import type { ProjectFilePreviewItem } from "@/types/project-file.types";

interface DocumentOutListProps {
  items: ProjectDocumentItem[];
  canMutate: boolean;
  onDelete: (doc: ProjectDocumentItem) => void;
}

function toPreviewItem(doc: ProjectDocumentItem): ProjectFilePreviewItem {
  return {
    id: doc.id,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes,
    uploadedAt: doc.uploadedAt,
    contentPath: doc.contentPath,
  };
}

export function DocumentOutList({ items, canMutate, onDelete }: DocumentOutListProps) {
  const [previewFile, setPreviewFile] = useState<ProjectFilePreviewItem | null>(null);

  return (
    <>
      <div className="divide-y divide-border/70 md:hidden">
        {items.map((doc) => {
          const item = toPreviewItem(doc);
          const previewable = canPreviewProjectFile(item);
          return (
            <div key={doc.id} className="space-y-2.5 p-4">
              <div className="flex items-start gap-2.5">
                <FileText className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-[13px] font-medium text-text-primary">{doc.fileName}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {formatIdDate(doc.uploadedAt)} · {Math.max(1, Math.round(doc.sizeBytes / 1024))} KB
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openProjectFile(item, setPreviewFile)}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-input px-3 text-xs font-medium text-text-primary transition-colors hover:bg-surface-active"
                >
                  {previewable ? <Eye className="size-3.5" /> : <ExternalLink className="size-3.5" />}
                  {previewable ? "Lihat / Unduh" : "Buka / Unduh"}
                </button>
                {canMutate && (
                  <Button type="button" variant="destructive" size="sm" className="h-10 shrink-0 px-3.5 text-xs" onClick={() => onDelete(doc)}>
                    Hapus
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader className="bg-surface-input/50">
            <TableRow className="border-border/80 hover:bg-transparent">
              <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">Nama Dokumen</TableHead>
              <TableHead className="h-10 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">Diunggah &amp; Ukuran</TableHead>
              <TableHead className="h-10 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((doc) => {
              const item = toPreviewItem(doc);
              const previewable = canPreviewProjectFile(item);
              return (
                <TableRow key={doc.id} className="border-border/60 hover:bg-surface-input/40">
                  <TableCell className="max-w-md px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
                      <span className="truncate text-[13px] font-medium text-text-primary">{doc.fileName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-text-secondary">
                    {formatIdDate(doc.uploadedAt)} · {Math.max(1, Math.round(doc.sizeBytes / 1024))} KB
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openProjectFile(item, setPreviewFile)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-surface-input px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary"
                      >
                        {previewable ? <Eye className="size-3.5" /> : <ExternalLink className="size-3.5" />}
                        {previewable ? "Lihat / Unduh" : "Buka / Unduh"}
                      </button>
                      {canMutate && (
                        <Button type="button" variant="destructive" size="sm" className="h-8 px-2.5 text-xs" onClick={() => onDelete(doc)}>
                          Hapus
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ProjectFilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
    </>
  );
}
