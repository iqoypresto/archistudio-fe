"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageInfoDialog } from "@/components/ui/PageInfoDialog";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { UnderlineTabsBar } from "@/components/ui/UnderlineTabsNav";
import { useArchivedProjectsQuery, useRestoreProjectMutation } from "@/hooks/project.hooks";
import { groupArchivedProjectsByYear, resolveProjectArchiveActions } from "@/lib/validation/project.validation";
import { useAuthStore } from "@/stores/auth.store";
import type { ArchivedProjectItem, ArchiveType } from "@/types/api/project.types";
import { ArchiveYearTable } from "./ArchiveYearTable";
import { RestoreProjectDialog } from "./RestoreProjectDialog";

type ArchiveTypeFilter = "ALL" | ArchiveType;

const ARCHIVE_TYPE_OPTIONS = [
  { value: "ALL", label: "Semua" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "MANUAL", label: "Arsip Manual" },
] as const;

export function ProjectArchiveContent() {
  const role = useAuthStore((state) => state.user?.role);
  const { canViewArchive } = resolveProjectArchiveActions(role);
  const isOwner = role === "OWNER";

  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState<ArchiveTypeFilter>("ALL");
  const [projectToRestore, setProjectToRestore] = useState<ArchivedProjectItem | null>(null);

  const archiveQuery = useArchivedProjectsQuery({ search: search.trim() || undefined }, { enabled: canViewArchive });
  const restoreMutation = useRestoreProjectMutation(() => setProjectToRestore(null));

  const allItems = useMemo(() => archiveQuery.data ?? [], [archiveQuery.data]);
  const allGroups = useMemo(() => groupArchivedProjectsByYear(allItems), [allItems]);
  const completedCount = allItems.filter((item) => item.archiveType === "COMPLETED").length;
  const manualCount = allItems.filter((item) => item.archiveType === "MANUAL").length;

  const visibleGroups = useMemo(() => {
    const byYear = selectedYear === "ALL" ? allGroups : allGroups.filter((g) => String(g.year) === selectedYear);
    if (typeFilter === "ALL") return byYear;
    return byYear.map((g) => ({ ...g, projects: g.projects.filter((p) => p.archiveType === typeFilter) })).filter((g) => g.projects.length > 0);
  }, [allGroups, selectedYear, typeFilter]);

  if (!canViewArchive) {
    return <div className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary">Halaman Archive Project hanya dapat diakses oleh Owner dan Admin.</div>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Archive Project"
        titleSuffix={
          <PageInfoDialog
            title="Tentang Archive Project"
            description="Daftar proyek yang telah selesai atau diarsipkan manual per tahun tindakan. Bersifat baca saja hingga dipulihkan oleh Owner."
          />
        }
      />

      <section className="overflow-hidden rounded-xl border border-border bg-surface tabular-nums">
        <UnderlineTabsBar
          ariaLabel="Filter tahun arsip proyek"
          activeValue={selectedYear}
          onChange={setSelectedYear}
          items={[
            { value: "ALL", label: "Semua Tahun", count: allItems.length },
            ...allGroups.map((g) => ({ value: String(g.year), label: String(g.year), count: g.projects.length })),
          ]}
          rightSlot={`${completedCount} selesai · ${manualCount} arsip manual`}
        />

        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari kode, nama proyek, klien, atau lokasi..." className="h-11 pl-8 sm:h-9 sm:text-xs" />
          </div>
          <SegmentedControl
            ariaLabel="Filter jenis arsip"
            options={ARCHIVE_TYPE_OPTIONS}
            value={typeFilter}
            onChange={setTypeFilter}
            className="grid w-full auto-cols-fr grid-flow-col sm:inline-flex sm:w-auto"
          />
        </div>

        <AsyncStateView
          isLoading={archiveQuery.isLoading}
          isError={archiveQuery.isError}
          error={archiveQuery.error}
          data={visibleGroups}
          isEmpty={(groups) => groups.length === 0}
          onRetry={() => archiveQuery.refetch()}
          emptyTitle="Belum ada proyek di Archive"
          emptyDescription="Proyek yang ditandai selesai atau diarsipkan manual oleh Owner akan muncul otomatis di sini menurut tahun tindakan."
        >
          {(groups) => (
            <div className="divide-y divide-border border-t border-border">
              {groups.map((group) => (
                <ArchiveYearTable key={group.year} year={group.year} projects={group.projects} isOwner={isOwner} onRestore={setProjectToRestore} />
              ))}
            </div>
          )}
        </AsyncStateView>
      </section>

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
