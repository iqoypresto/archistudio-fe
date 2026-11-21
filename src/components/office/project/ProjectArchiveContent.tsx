"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Calendar, ExternalLink, Folder, MapPin, RotateCcw, Search } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useArchivedProjectsQuery, useRestoreProjectMutation } from "@/hooks/project.hooks";
import {
  groupArchivedProjectsByYear,
  resolveProjectArchiveActions,
} from "@/lib/validation/project.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { ArchivedProjectItem } from "@/types/api/project.types";
import { RestoreProjectDialog } from "./RestoreProjectDialog";

export function ProjectArchiveContent() {
  const role = useAuthStore((state) => state.user?.role);
  const { canViewArchive } = resolveProjectArchiveActions(role);
  const isOwner = role === "OWNER";

  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [projectToRestore, setProjectToRestore] = useState<ArchivedProjectItem | null>(null);

  const archiveQuery = useArchivedProjectsQuery(
    { search: search.trim() || undefined },
    { enabled: canViewArchive },
  );
  const restoreMutation = useRestoreProjectMutation(() => setProjectToRestore(null));

  const allGroups = useMemo(
    () => groupArchivedProjectsByYear(archiveQuery.data ?? []),
    [archiveQuery.data],
  );
  const visibleGroups = useMemo(
    () => (selectedYear ? allGroups.filter((group) => group.year === selectedYear) : allGroups),
    [allGroups, selectedYear],
  );

  if (!canViewArchive) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary">
        Halaman Archive Project hanya dapat diakses oleh Owner dan Admin (BR-39).
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Archive Project"
        description="Daftar project selesai atau diarsipkan manual per folder tahun tindakan. Bersifat baca saja hingga dipulihkan oleh Owner (BR-12, BR-39)."
      />

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3.5 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari kode, nama project, client, lokasi..."
            className="h-9 pl-9 text-xs"
          />
        </div>
        <div className="w-56">
          <Select
            value={selectedYear ? String(selectedYear) : "ALL"}
            onValueChange={(val: string | null) =>
              setSelectedYear(!val || val === "ALL" ? undefined : Number(val))
            }
          >
            <SelectTrigger aria-label="Filter Folder Tahun Archive" className="h-9 text-xs">
              <SelectValue placeholder="Semua Folder Tahun">
                {selectedYear ? `Tahun ${selectedYear}` : "Semua Folder Tahun"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Folder Tahun</SelectItem>
              {allGroups.map((group) => (
                <SelectItem key={group.year} value={String(group.year)}>
                  Tahun {group.year} ({group.projects.length} project)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AsyncStateView
        isLoading={archiveQuery.isLoading}
        isError={archiveQuery.isError}
        error={archiveQuery.error}
        data={visibleGroups}
        isEmpty={(groups) => groups.length === 0}
        onRetry={() => archiveQuery.refetch()}
        emptyTitle="Belum ada project di Archive"
        emptyDescription="Project yang ditandai selesai atau diarsipkan manual oleh Owner akan muncul otomatis di sini menurut tahun tindakan."
      >
        {(groups) => (
          <div className="space-y-5">
            {groups.map((group) => (
              <section
                key={group.year}
                className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
              >
                <div className="flex items-center justify-between border-b border-border/70 pb-3">
                  <h2 className="flex items-center gap-2 text-sm font-medium text-text-primary">
                    <Folder className="h-4 w-4 text-text-secondary" />
                    Folder Tahun {group.year}
                  </h2>
                  <span className="rounded-md border border-border bg-surface-input px-2.5 py-1 font-mono text-xs tabular-nums text-text-secondary">
                    {group.projects.length} project
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
                  {group.projects.map((project) => (
                    <article
                      key={project.id}
                      className="flex flex-col justify-between rounded-xl border border-border/80 bg-surface-input/70 p-4 transition-colors hover:border-white/[0.14]"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex h-11 w-14 items-center justify-center rounded-lg border border-border bg-surface font-mono text-xs font-semibold tracking-wider text-text-primary">
                            {project.code}
                          </div>
                          <StatusBadge tone={project.archiveType === "COMPLETED" ? "success" : "warning"}>
                            {project.archiveType === "COMPLETED" ? "Selesai" : "Arsip Manual"}
                          </StatusBadge>
                        </div>

                        <div className="space-y-1 text-xs text-text-secondary">
                          <h3 className="text-sm font-medium tracking-tight text-text-primary">{project.name}</h3>
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                            {project.clientName} • {project.location}
                          </p>
                          <p className="flex items-center gap-1.5 text-[11px] text-text-muted">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {project.archiveType === "COMPLETED" ? "Diselesaikan" : "Diarsipkan"}:{" "}
                            <strong className="font-mono text-text-secondary">{project.archivedActionAt.slice(0, 10)}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-active px-3 text-xs font-medium text-text-primary transition-colors hover:bg-primary-hover"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Buka Detail
                        </Link>
                        {isOwner ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 gap-1 px-2.5 text-xs text-text-secondary hover:text-text-primary"
                            onClick={() => setProjectToRestore(project)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Pulihkan
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 text-xs text-text-muted">
                            <Archive className="h-3.5 w-3.5" /> Baca saja
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </AsyncStateView>

      {isOwner && (
        <RestoreProjectDialog
          isOpen={Boolean(projectToRestore)}
          onClose={() => setProjectToRestore(null)}
          targetProject={projectToRestore}
          onConfirm={(id, payload) => restoreMutation.mutate({ id, payload })}
          isSubmitting={restoreMutation.isPending}
        />
      )}
    </div>
  );
}
