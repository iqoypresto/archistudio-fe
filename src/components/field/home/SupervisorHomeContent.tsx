"use client";

import { useMyReportHistoryQuery } from "@/hooks/report.hooks";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";
import { getRoleLabel } from "@/lib/utils/role";
import { useAuthStore } from "@/stores/auth.store";
import { SupervisorHomeHero } from "./SupervisorHomeHero";
import { SupervisorHomeReportList } from "./SupervisorHomeReportList";
import { SupervisorHomeTaskCard } from "./SupervisorHomeTaskCard";

export function SupervisorHomeContent() {
  const user = useAuthStore((state) => state.user);
  const name = user?.name?.trim() || getRoleLabel(user?.role);
  const areasQuery = useMyAreasStatusQuery();
  const reportsQuery = useMyReportHistoryQuery({
    page: 1,
    pageSize: 3,
    sortBy: "submittedAt",
    sortOrder: "desc",
  });

  return (
    <div className="min-h-full bg-[var(--project-canvas)]">
      <SupervisorHomeHero name={name} />
      <div className="relative z-10 -mt-5 min-h-[70dvh] space-y-6 rounded-t-[2rem] bg-[var(--project-canvas)] px-4 pb-8 pt-0">
        <SupervisorHomeTaskCard
          areas={areasQuery.data}
          loading={areasQuery.isLoading}
          failed={areasQuery.isError}
          retry={() => void areasQuery.refetch()}
        />
        <SupervisorHomeReportList
          reports={reportsQuery.data?.data}
          loading={reportsQuery.isLoading}
          failed={reportsQuery.isError}
          retry={() => void reportsQuery.refetch()}
        />
      </div>
    </div>
  );
}
