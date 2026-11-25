"use client";

import { useState } from "react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { useProjectsQuery } from "@/hooks/project.hooks";
import type { ProjectFilterParams } from "@/types/api/project.types";
import { SupervisorProjectHero } from "./SupervisorProjectHero";
import { SupervisorProjectList, SupervisorProjectListSkeleton } from "./SupervisorProjectList";

export function SupervisorProjectContent() {
  const [filters, setFilters] = useState<ProjectFilterParams>({
    page: 1,
    pageSize: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const projectsQuery = useProjectsQuery(filters, {
    surface: "field",
    keepPreviousData: true,
  });

  return (
    <div className="min-h-full bg-[var(--project-canvas)]">
      <SupervisorProjectHero />
      <div className="relative z-10 -mt-5 min-h-[70dvh] rounded-t-[2rem] bg-[var(--project-canvas)] pb-8 pt-1 [&_button]:min-h-12">
        <AsyncStateView
          isLoading={projectsQuery.isLoading}
          isError={projectsQuery.isError}
          error={projectsQuery.error}
          data={projectsQuery.data}
          onRetry={() => projectsQuery.refetch()}
          loadingFallback={<SupervisorProjectListSkeleton />}
          emptyTitle="Belum ada project ditugaskan"
          emptyDescription="Project yang ditugaskan kepadamu akan tampil di sini."
        >
          {(result) => (
            <SupervisorProjectList
              projects={result.data}
              meta={result.meta}
              onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
              isPageChanging={projectsQuery.isPlaceholderData}
            />
          )}
        </AsyncStateView>
      </div>
    </div>
  );
}
