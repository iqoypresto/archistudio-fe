"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, Calendar, ExternalLink, Folder, MapPin, RotateCcw, Search } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="text-text-secondary absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari kode, nama project, client, lokasi..."
            className="h-11 pl-9"
          />
        </div>
        <select
          value={selectedYear ?? ""}
          onChange={(event) =>
            setSelectedYear(event.target.value ? Number(event.target.value) : undefined)
          }
          aria-label="Filter Folder Tahun Archive"
          className="border-border bg-surface text-text-primary focus:ring-primary h-11 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
        >
          <option value="">Semua Folder Tahun</option>
          {allGroups.map((group) => (
            <option key={group.year} value={group.year}>
              Tahun {group.year} ({group.projects.length} project)
            </option>
          ))}
        </select>
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
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.year} className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
                    <Folder className="h-4 w-4 text-primary" />
                    Folder Tahun {group.year}
                  </h2>
                  <span className="text-xs text-text-secondary">
                    {group.projects.length} project
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {group.projects.map((project) => (
                    <article
                      key={project.id}
                      className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4 shadow-xs"
                    >
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                              {project.code}
                            </span>
                            <h3 className="font-semibold text-text-primary">{project.name}</h3>
                          </div>
                          <StatusBadge
                            tone={project.archiveType === "COMPLETED" ? "success" : "warning"}
                          >
                            {project.archiveType === "COMPLETED" ? "Selesai" : "Arsip Manual"}
                          </StatusBadge>
                        </div>

                        <div className="space-y-1 text-xs text-text-secondary">
                          <p className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {project.clientName} • {project.location}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {project.archiveType === "COMPLETED" ? "Diselesaikan" : "Diarsipkan"}:{" "}
                            <strong>{project.archivedActionAt.slice(0, 10)}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Buka Detail (Baca Saja)
                        </Link>
                        {isOwner ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="min-h-11 gap-1.5 text-xs"
                            onClick={() => setProjectToRestore(project)}
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Pulihkan
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
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
