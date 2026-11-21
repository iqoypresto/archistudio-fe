"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderKanban, RotateCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectsQuery } from "@/hooks/project.hooks";
import type { ProjectListItem } from "@/types/api/project.types";

const ALL_PROJECTS_VALUE = "__ALL_PROJECTS__";

export function ProjectSwitcher({
  activeProject,
  compact = false,
}: {
  activeProject?: ProjectListItem | null;
  compact?: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const projectsQuery = useProjectsQuery({
    page: 1,
    pageSize: 100,
    search: search.trim() || undefined,
  });
  const options = projectsQuery.data?.data ?? [];
  const includesActive =
    activeProject && options.every((project) => project.id !== activeProject.id);
  const allOptions = includesActive && activeProject ? [activeProject, ...options] : options;
  const selectedProject =
    allOptions.find((item) => item.id === activeProject?.id) ?? activeProject ?? null;
  const selectedLabel = selectedProject
    ? `${selectedProject.code} · ${selectedProject.name}`
    : "Pilih project";

  function openProject(value: string | null): void {
    if (value && value !== ALL_PROJECTS_VALUE) router.push(`/projects/${value}`);
    else router.push("/projects");
  }

  return (
    <section className={compact ? "w-52" : "space-y-2"} aria-label="Project Switcher">
      {!compact && (
        <div className="flex items-center justify-between px-1">
          <span className="flex items-center gap-1.5 text-[11px] font-medium tracking-wider text-text-muted uppercase">
            <FolderKanban className="size-3.5" />
            Project Switcher
          </span>
          <Link
            href="/projects"
            className="text-[11px] font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Semua
          </Link>
        </div>
      )}
      {!compact && (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-text-muted" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari project..."
            aria-label="Cari project"
            className="h-8 pl-8 text-xs"
          />
        </div>
      )}
      <Select
        value={activeProject?.id ?? ALL_PROJECTS_VALUE}
        onValueChange={openProject}
      >
        <SelectTrigger
          aria-label="Pilih project"
          className={compact ? "h-8 text-xs" : "h-9 text-xs"}
        >
          <SelectValue placeholder="Pilih project">{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_PROJECTS_VALUE}>Semua Project</SelectItem>
          {allOptions.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.code} · {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!compact && projectsQuery.isLoading && (
        <p className="px-1 text-[11px] text-text-muted">Memuat project...</p>
      )}
      {!compact && projectsQuery.isError && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => projectsQuery.refetch()}
          className="h-8 w-full justify-start px-2 text-xs"
        >
          <RotateCw className="mr-1.5 size-3.5" /> Gagal memuat · Coba lagi
        </Button>
      )}
      {!compact &&
        !projectsQuery.isLoading &&
        !projectsQuery.isError &&
        options.length === 0 && (
          <p className="px-1 text-[11px] text-text-muted">
            Tidak ada project yang dapat diakses.
          </p>
        )}
    </section>
  );
}
