"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectFileCard } from "@/components/field/project/ProjectFileCard";
import { ProjectFilePreviewDialog } from "@/components/field/project/ProjectFilePreviewDialog";
import { useProjectCommsQuery } from "@/hooks/comms.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { isCommsAllowedRole } from "@/lib/utils/role";
import { openProjectFile } from "@/lib/utils/project-file";
import { useAuthStore } from "@/stores/auth.store";
import type { CommsDirection, CommsEntryItem } from "@/types/api/comms.types";
import type { ProjectFilePreviewItem } from "@/types/project-file.types";

export function FieldCommsDocumentsContent({ projectId }: { projectId: string }) {
  const role = useAuthStore((state) => state.user?.role);
  const canView = isCommsAllowedRole(role);
  const [direction, setDirection] = useState<CommsDirection>("INBOUND");
  const [search, setSearch] = useState("");
  const [previewFile, setPreviewFile] = useState<ProjectFilePreviewItem | null>(null);
  const projectQuery = useProjectDetailQuery(projectId, "field");
  const commsQuery = useProjectCommsQuery(projectId, undefined, { enabled: canView }, "field");
  const files = useMemo(() => (commsQuery.data ?? []).filter((entry) => entry.attachmentContentPath)
    .map(mapAttachment).sort((a, b) => compareDates(b.uploadedAt, a.uploadedAt)), [commsQuery.data]);
  const inbound = files.filter((file) => file.direction === "INBOUND");
  const outbound = files.filter((file) => file.direction === "OUTBOUND");
  const countLabel = commsQuery.isLoading ? "Memuat dokumen…" : `${files.length} file komunikasi`;

  if (!canView) return <ErrorState title="Comms tidak tersedia" description="Akun ini tidak memiliki akses ke komunikasi project." />;

  return (
    <div className="space-y-5 text-[var(--project-text-heading)]">
      <header className="space-y-1 px-1 pt-3">
        <h1 className="break-words text-[1.8rem] font-bold leading-tight tracking-tight sm:text-3xl">{projectQuery.data?.name ?? "Project"}</h1>
        <p className="text-lg text-[var(--project-text-secondary)]">{countLabel}</p>
      </header>
      {projectQuery.isError && <ErrorState description={projectQuery.error.message} onRetry={() => void projectQuery.refetch()} />}
      <Tabs value={direction} onValueChange={(value) => {
        if (value === "INBOUND" || value === "OUTBOUND") setDirection(value);
        setSearch("");
      }} className="gap-0">
        <TabsList aria-label="Arah komunikasi" variant="default"
          className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-[var(--project-border)] bg-[#fffaf7] p-1 group-data-horizontal/tabs:h-auto">
          <TabsTrigger value="INBOUND" className="h-auto min-h-11 min-w-0 rounded-xl px-2 py-2 text-base font-semibold text-[var(--project-text-secondary)] data-active:bg-[var(--project-action)] data-active:text-white data-active:shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--project-action)] focus-visible:ring-offset-1">
            Comms In
          </TabsTrigger>
          <TabsTrigger value="OUTBOUND" className="h-auto min-h-11 min-w-0 rounded-xl px-2 py-2 text-base font-semibold text-[var(--project-text-secondary)] data-active:bg-[var(--project-action)] data-active:text-white data-active:shadow-sm focus-visible:ring-2 focus-visible:ring-[var(--project-action)] focus-visible:ring-offset-1">
            Comms Out
          </TabsTrigger>
        </TabsList>
        <TabsContent value="INBOUND" className="pt-5">
          <DirectionPanel direction="INBOUND" files={inbound} isLoading={commsQuery.isLoading} isError={commsQuery.isError}
            error={commsQuery.error} search={search} onSearch={setSearch} onRetry={() => void commsQuery.refetch()}
            onOpen={(file) => openProjectFile(file, setPreviewFile)} />
        </TabsContent>
        <TabsContent value="OUTBOUND" className="pt-5">
          <DirectionPanel direction="OUTBOUND" files={outbound} isLoading={commsQuery.isLoading} isError={commsQuery.isError}
            error={commsQuery.error} search={search} onSearch={setSearch} onRetry={() => void commsQuery.refetch()}
            onOpen={(file) => openProjectFile(file, setPreviewFile)} />
        </TabsContent>
      </Tabs>
      <ProjectFilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
    </div>
  );
}

function DirectionPanel({ direction, files, isLoading, isError, error, search, onSearch, onRetry, onOpen }: {
  direction: CommsDirection; files: CommsFile[]; isLoading: boolean; isError: boolean; error: Error | null;
  search: string; onSearch: (value: string) => void; onRetry: () => void; onOpen: (file: ProjectFilePreviewItem) => void;
}) {
  const incoming = direction === "INBOUND";
  const query = search.trim().toLocaleLowerCase("id-ID");
  const filtered = query ? files.filter((file) => file.fileName.toLocaleLowerCase("id-ID").includes(query)) : files;
  const documents = `${filtered.length} dokumen ${incoming ? "masuk" : "keluar"}`;

  return (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-6 -translate-y-1/2 text-[var(--project-action)]" aria-hidden="true" />
        <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Cari dokumen"
          aria-label={`Cari dokumen Comms ${incoming ? "In" : "Out"}`} className="h-14 rounded-[1.125rem] border-[var(--project-border)] bg-white pl-12 text-base text-[var(--project-text-heading)] placeholder:text-[var(--project-text-secondary)] focus-visible:ring-[var(--project-action)]" />
      </label>
      <h2 className="text-xl font-bold">{documents}</h2>
      <AsyncStateView isLoading={isLoading} isError={isError} error={error} data={filtered}
        isEmpty={(items) => items.length === 0} onRetry={onRetry}
        emptyTitle={query ? "Dokumen tidak ditemukan" : `Belum ada dokumen Comms ${incoming ? "In" : "Out"}`}
        emptyDescription={query ? "Coba kata kunci nama dokumen yang lain." : "Dokumen yang diunggah akan muncul di sini."}>
        {(items) => <div className="space-y-3">{items.map((file) => <ProjectFileCard key={file.id} file={file} onOpen={onOpen} />)}</div>}
      </AsyncStateView>
    </div>
  );
}

interface CommsFile extends ProjectFilePreviewItem { direction: CommsDirection }

function mapAttachment(entry: CommsEntryItem): CommsFile {
  return { id: entry.id, fileName: entry.attachmentName ?? entry.subject, mimeType: entry.attachmentMime ?? "application/octet-stream",
    sizeBytes: entry.attachmentBytes ?? 0, uploadedAt: entry.attachmentUploadedAt ?? entry.createdAt, contentPath: entry.attachmentContentPath ?? "",
    secondaryLabel: entry.createdBy?.name ? `Pengunggah: ${entry.createdBy.name}` : undefined, direction: entry.direction };
}

function compareDates(left: string | null, right: string | null): number {
  return new Date(right ?? 0).getTime() - new Date(left ?? 0).getTime();
}
