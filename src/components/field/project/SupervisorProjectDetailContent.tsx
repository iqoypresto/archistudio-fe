"use client";

import { useProjectAreasQuery } from "@/hooks/area.hooks";
import { useProjectCommsQuery } from "@/hooks/comms.hooks";
import { useProjectDrawingsQuery } from "@/hooks/drawing.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { isCommsAllowedRole } from "@/lib/utils/role";
import { useAuthStore } from "@/stores/auth.store";
import { SupervisorProjectDetail } from "./SupervisorProjectDetail";

export function SupervisorProjectDetailContent({ projectId }: { projectId: string }) {
  const role = useAuthStore((state) => state.user?.role);
  const canAccessComms = isCommsAllowedRole(role);
  const projectQuery = useProjectDetailQuery(projectId, "field");
  const areasQuery = useProjectAreasQuery(projectId, "field");
  const drawingsQuery = useProjectDrawingsQuery(projectId, undefined, undefined, "field");
  const commsQuery = useProjectCommsQuery(projectId, undefined, { enabled: canAccessComms }, "field");
  const commsCount = commsQuery.data?.filter((entry) => entry.attachmentContentPath).length ?? null;

  return (
    <SupervisorProjectDetail
      project={projectQuery.data}
      areas={areasQuery.data}
      drawingCount={drawingsQuery.data?.length ?? null}
      commsCount={commsCount}
      isLoading={projectQuery.isLoading || areasQuery.isLoading}
      isError={projectQuery.isError || areasQuery.isError}
      error={projectQuery.error ?? areasQuery.error}
      onRetry={() => {
        void projectQuery.refetch();
        void areasQuery.refetch();
        void drawingsQuery.refetch();
        if (canAccessComms) void commsQuery.refetch();
      }}
      canAccessComms={canAccessComms}
      isSiteManager={role === "SITE_MANAGER"}
    />
  );
}
