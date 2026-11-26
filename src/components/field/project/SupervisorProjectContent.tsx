"use client";

import { useState } from "react";
import { FieldMainPageLayout } from "@/components/layout/FieldMainPageLayout";
import { FieldMainPageTitle } from "@/components/layout/FieldMainPageTitle";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { useProjectsQuery } from "@/hooks/project.hooks";
import type { ProjectFilterParams } from "@/types/api/project.types";
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
    <FieldMainPageLayout
      headerContent={<FieldMainPageTitle>Project</FieldMainPageTitle>}
      overlap="raised"
    >
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
    </FieldMainPageLayout>
  );
}
