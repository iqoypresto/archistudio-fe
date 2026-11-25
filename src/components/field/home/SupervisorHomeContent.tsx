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
    <div className="min-h-full bg-surface">
      <SupervisorHomeHero name={name} />
      <div className="relative -mt-6 min-h-[81dvh] rounded-t-2xl bg-surface px-5 pb-8 pt-6 shadow-[0_-4px_16px_rgba(5,14,29,0.10)]">
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
