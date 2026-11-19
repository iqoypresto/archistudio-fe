"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderKanban, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectsQuery } from "@/hooks/project.hooks";
import type { ProjectListItem } from "@/types/api/project.types";

export function ProjectSwitcher({
  activeProject,
  compact = false,
}: {
  activeProject?: ProjectListItem | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const projectsQuery = useProjectsQuery({ page: 1, pageSize: 100, search: search.trim() || undefined });
  const options = projectsQuery.data?.data ?? [];
  const includesActive = activeProject && options.every((project) => project.id !== activeProject.id);

  function openProject(projectId: string): void {
    if (projectId) router.push(`/projects/${projectId}`);
    else router.push("/projects");
  }

  return (
    <section className={compact ? "w-56" : "space-y-2"} aria-label="Project Switcher">
      {!compact && <div className="flex items-center gap-2 px-1 text-sm font-semibold text-text-primary">
        <FolderKanban className="size-4" />
        <span>Project Switcher</span>
      </div>}
      {!compact && <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Cari project..."
        aria-label="Cari project"
        className="h-10"
      />}
      <select
        value={activeProject?.id ?? ""}
        onChange={(event) => openProject(event.target.value)}
        aria-label="Pilih project"
        className={`w-full rounded-lg border border-border bg-surface-input px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-ring ${compact ? "h-10" : "h-11"}`}
      >
        <option value="">Pilih project</option>
        {includesActive && activeProject && <option value={activeProject.id}>{activeProject.code} · {activeProject.name}</option>}
        {options.map((project) => <option key={project.id} value={project.id}>{project.code} · {project.name}</option>)}
      </select>
      {!compact && <Link href="/projects" className="block rounded-md px-2 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-active hover:text-text-primary">
        Semua Project
      </Link>}
      {!compact && projectsQuery.isLoading && <p className="px-1 text-xs text-text-muted">Memuat project...</p>}
      {!compact && projectsQuery.isError && (
        <Button type="button" variant="ghost" onClick={() => projectsQuery.refetch()} className="h-9 w-full justify-start px-2 text-xs">
          <RotateCw className="mr-2 size-3.5" /> Gagal memuat · Coba lagi
        </Button>
      )}
      {!compact && !projectsQuery.isLoading && !projectsQuery.isError && options.length === 0 && (
        <p className="px-1 text-xs text-text-muted">Tidak ada project yang dapat diakses.</p>
      )}
    </section>
  );
}
