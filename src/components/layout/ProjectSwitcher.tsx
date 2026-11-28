"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useProjectsQuery } from "@/hooks/project.hooks";
import type { ProjectListItem } from "@/types/api/project.types";
import type { UserRole } from "@/types/api/auth.types";
import { isFieldRole } from "@/lib/utils/role";

function projectLabel(project: ProjectListItem): string {
  return `${project.code} · ${project.name}`;
}

export function ProjectSwitcher({
  activeProject,
  onNavigate,
  role,
  compact = false,
}: {
  activeProject?: ProjectListItem | null;
  onNavigate?: () => void;
  role: UserRole;
  compact?: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const surface = isFieldRole(role) ? "field" : "office";
  const projectRoot = `/${surface}/projects`;
  const projectsQuery = useProjectsQuery({
    page: 1,
    pageSize: 100,
    search: search.trim() || undefined,
  }, { staleTime: 60_000, surface });
  const options = projectsQuery.data?.data ?? [];
  const includesActive =
    activeProject && options.every((project) => project.id !== activeProject.id);
  const projects = includesActive && activeProject ? [activeProject, ...options] : options;

  function openProject(project: ProjectListItem | null): void {
    if (!project) return;
    setSearch("");
    onNavigate?.();
    router.push(`${projectRoot}/${project.id}`);
  }

  function handleInputValueChange(
    inputValue: string,
    eventDetails: { reason: string },
  ): void {
    if (eventDetails.reason === "input-change") {
      setSearch(inputValue);
      return;
    }
    if (
      eventDetails.reason === "input-clear" ||
      eventDetails.reason === "clear-press" ||
      eventDetails.reason === "item-press"
    ) {
      setSearch("");
    }
  }

  return (
    <section className={compact ? "w-full space-y-2" : "space-y-2"} aria-label="Project Switcher">
      {!compact && <div className="flex items-center gap-2 px-1 text-sm font-semibold text-text-primary">
        <FolderKanban className="size-4" aria-hidden="true" />
        <span>Project Switcher</span>
      </div>}
      <Combobox
        items={projects}
        value={activeProject ?? null}
        itemToStringLabel={projectLabel}
        itemToStringValue={(project) => project.id}
        isItemEqualToValue={(item, value) => item.id === value.id}
        onValueChange={openProject}
        onInputValueChange={handleInputValueChange}
      >
        <ComboboxInput
          aria-label="Cari dan pilih project"
          placeholder="Cari project..."
          showClear={Boolean(search)}
          className={`w-full rounded-lg border-border bg-surface-input text-base text-text-primary placeholder:text-text-muted focus-within:ring-2 focus-within:ring-ring md:text-sm ${compact ? "h-11 md:h-9" : "h-11 md:h-10"}`}
        />
        <ComboboxContent className="overflow-hidden rounded-lg border border-border bg-surface p-1 text-text-primary shadow-lg">
          <ComboboxEmpty className="px-3 py-2 text-sm text-text-muted">
            {projectsQuery.isLoading ? "Memuat project..." : "Project tidak ditemukan."}
          </ComboboxEmpty>
          <ComboboxList className="max-h-72 overflow-y-auto">
            {(project: ProjectListItem) => (
              <ComboboxItem
                key={project.id}
                value={project}
                className="cursor-pointer rounded-md px-3 py-2.5 text-sm text-text-primary data-highlighted:bg-surface-active"
              >
                {projectLabel(project)}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {projectsQuery.isError && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => projectsQuery.refetch()}
          className="h-9 w-full justify-start px-2 text-xs"
        >
          <RotateCw className="mr-2 size-3.5" /> Gagal memuat · Coba lagi
        </Button>
      )}
    </section>
  );
}
