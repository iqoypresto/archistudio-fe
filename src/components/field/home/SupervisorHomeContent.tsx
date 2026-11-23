"use client";

import { useMyReportHistoryQuery } from "@/hooks/report.hooks";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";
import { useAuthStore } from "@/stores/auth.store";
import { SupervisorHomeHero } from "./SupervisorHomeHero";
import { SupervisorHomeReportList } from "./SupervisorHomeReportList";
import { SupervisorHomeTaskCard } from "./SupervisorHomeTaskCard";

export function SupervisorHomeContent() {
  const name = useAuthStore((state) => state.user?.name?.trim() || "Supervisor");
  const areasQuery = useMyAreasStatusQuery();
  const reportsQuery = useMyReportHistoryQuery({
    page: 1,
    pageSize: 3,
    sortBy: "submittedAt",
    sortOrder: "desc",
  });

  return (
    <div className="min-h-full bg-surface">
      <SupervisorHomeHero name={name} />
      <div className="relative -mt-7 min-h-[calc(100dvh-224px)] rounded-t-[2rem] bg-surface px-5 pb-8 pt-7 shadow-[0_-8px_28px_rgba(5,14,29,0.12)]">
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
