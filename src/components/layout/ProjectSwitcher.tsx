"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [opened, setOpened] = useState(false);
  const projectsQuery = useProjectsQuery({ page: 1, pageSize: 100 }, { enabled: opened, staleTime: 5 * 60 * 1000 });
  const options = (projectsQuery.data?.data ?? []).filter((project) => project.status === "PERSIAPAN" || project.status === "BERJALAN");

  function openProject(projectId: string): void {
    if (projectId) {
      document.cookie = `lastProjectId=${encodeURIComponent(projectId)}; Path=/; Max-Age=31536000; SameSite=Lax`;
      router.push(`/projects/${projectId}`);
    }
    else router.push("/projects");
  }

  return (
    <section className={compact ? "w-56" : "space-y-2"} aria-label="Project Switcher">
      {!compact && <div className="flex items-center gap-2 px-1 text-sm font-semibold text-text-primary">
        <FolderKanban className="size-4" />
        <span>Project</span>
      </div>}
      <Select
        value={activeProject?.id ?? null}
        onValueChange={(value) => openProject(typeof value === "string" ? value : "")}
        onOpenChange={(isOpen) => isOpen && setOpened(true)}
      >
        <SelectTrigger aria-label="Pilih project" className={`h-11 min-h-11 w-full bg-surface-input ${compact ? "h-10" : ""}`}>
          <SelectValue placeholder="Pilih project" />
        </SelectTrigger>
        <SelectContent>
          {options.map((project) => <SelectItem key={project.id} value={project.id}>{project.code} · {project.name}</SelectItem>)}
        </SelectContent>
      </Select>
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
