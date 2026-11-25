"use client";

import { useProjectAreasQuery } from "@/hooks/area.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { SupervisorProjectDetail } from "./SupervisorProjectDetail";

export function SupervisorProjectDetailContent({ projectId }: { projectId: string }) {
  const projectQuery = useProjectDetailQuery(projectId, "field");
  const areasQuery = useProjectAreasQuery(projectId, "field");

  return (
    <SupervisorProjectDetail
      project={projectQuery.data}
      areas={areasQuery.data}
      isLoading={projectQuery.isLoading || areasQuery.isLoading}
      isError={projectQuery.isError || areasQuery.isError}
      error={projectQuery.error ?? areasQuery.error}
      onRetry={() => {
        void projectQuery.refetch();
        void areasQuery.refetch();
      }}
    />
  );
}
