"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Input } from "@/components/ui/input";
import { ProjectFileCard } from "@/components/field/project/ProjectFileCard";
import { ProjectFilePreviewDialog } from "@/components/field/project/ProjectFilePreviewDialog";
import { useProjectDrawingsQuery } from "@/hooks/drawing.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { openProjectFile } from "@/lib/utils/project-file";
import type { ProjectFilePreviewItem } from "@/types/project-file.types";
import type { DrawingItem } from "@/types/api/drawing.types";

export function FieldDrawingListContent({ projectId }: { projectId: string }) {
  const [search, setSearch] = useState("");
  const [previewFile, setPreviewFile] = useState<ProjectFilePreviewItem | null>(null);
  const projectQuery = useProjectDetailQuery(projectId, "field");
  const drawingsQuery = useProjectDrawingsQuery(projectId, undefined, undefined, "field");
  const files = useMemo(() => (drawingsQuery.data ?? []).filter((item) => !item.archivedAt)
    .map(mapDrawing).sort((a, b) => compareDates(b.uploadedAt, a.uploadedAt)), [drawingsQuery.data]);
  const filteredFiles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return query ? files.filter((file) => file.fileName.toLocaleLowerCase("id-ID").includes(query)) : files;
  }, [files, search]);

  return (
    <div className="space-y-5 text-[var(--project-text-heading)]">
      <header className="space-y-1 px-1 pt-3">
        <h1 className="break-words text-[1.8rem] font-bold leading-tight tracking-tight sm:text-3xl">{projectQuery.data?.name ?? "Project"}</h1>
        <p className="text-lg text-[var(--project-text-secondary)]">
          {drawingsQuery.isLoading ? "Memuat gambar…" : `${files.length} file gambar`}
        </p>
      </header>
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-[var(--project-action)]" aria-hidden="true" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama file"
          aria-label="Cari nama file gambar" className="h-14 rounded-[1.125rem] border-[var(--project-border)] bg-white pl-12 text-base text-[var(--project-text-heading)] placeholder:text-[var(--project-text-secondary)] focus-visible:ring-[var(--project-action)]" />
      </label>
      <AsyncStateView isLoading={drawingsQuery.isLoading} isError={drawingsQuery.isError} error={drawingsQuery.error}
        data={filteredFiles} isEmpty={(items) => items.length === 0} onRetry={() => void drawingsQuery.refetch()}
        emptyTitle={search.trim() ? "File tidak ditemukan" : "Belum ada gambar di project ini"}
        emptyDescription={search.trim() ? "Coba kata kunci nama file yang lain." : "Gambar project yang tersedia akan muncul di sini."}>
        {(items) => <div className="space-y-3">{items.map((file) => <ProjectFileCard key={file.id} file={file}
          onOpen={(item) => openProjectFile(item, setPreviewFile)} />)}</div>}
      </AsyncStateView>
      <ProjectFilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}

function mapDrawing(item: DrawingItem): ProjectFilePreviewItem {
  return { id: item.id, fileName: item.fileName, mimeType: item.mimeType, sizeBytes: item.sizeBytes,
    uploadedAt: item.uploadedAt, contentPath: item.contentPath };
}

function compareDates(left: string | null, right: string | null): number {
  return new Date(right ?? 0).getTime() - new Date(left ?? 0).getTime();
}
