"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { useProjectOptionsQuery } from "@/hooks/project.hooks";
import type { ProjectOption } from "@/types/api/project.types";

export function ProjectSwitcher({
  activeProject,
  onNavigate,
}: {
  activeProject?: ProjectOption | null;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const projectsQuery = useProjectOptionsQuery({ enabled: opened });
  const options = projectsQuery.data ?? [];

  function openProject(projectId: string): void {
    if (projectId) {
      document.cookie = `lastProjectId=${encodeURIComponent(projectId)}; Path=/; Max-Age=31536000; SameSite=Lax`;
      onNavigate?.();
      router.push(`/projects/${projectId}`);
    }
    else router.push("/projects");
  }

  return (
    <section className="space-y-2" aria-label="Pemilih project">
      <Combobox
        items={options}
        value={activeProject ?? null}
        itemToStringLabel={(project) => `${project.code} · ${project.name}`}
        itemToStringValue={(project) => project.id}
        isItemEqualToValue={(item, value) => item.id === value.id}
        onValueChange={(project) => project && openProject(project.id)}
        onOpenChange={setOpened}
      >
        <ComboboxInput
          aria-label="Pilih project"
          placeholder="Pilih project..."
          className="focus-within:border-input focus-within:bg-transparent focus-within:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-input has-[[data-slot=input-group-control]:focus-visible]:bg-transparent has-[[data-slot=input-group-control]:focus-visible]:ring-0"
        />
        <ComboboxContent>
          <ComboboxEmpty>
            {projectsQuery.isLoading ? "Memuat project..." : "Project tidak ditemukan."}
          </ComboboxEmpty>
          <ComboboxList>
            {(project: ProjectOption) => (
              <ComboboxItem key={project.id} value={project}>
                {project.code} · {project.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {projectsQuery.isError && (
        <Button type="button" variant="ghost" onClick={() => projectsQuery.refetch()} className="h-9 w-full justify-start px-2 text-xs">
          <RotateCw className="mr-2 size-3.5" /> Gagal memuat · Coba lagi
        </Button>
      )}
    </section>
  );
}
