"use client";

import { useMyReportHistoryQuery } from "@/hooks/report.hooks";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";
import { FieldMainPageLayout } from "@/components/layout/FieldMainPageLayout";
import { Badge } from "@/components/ui/badge";
import { getTodayInJakarta } from "@/lib/utils/office-format";
import { getRoleLabel } from "@/lib/utils/role";
import { useAuthStore } from "@/stores/auth.store";
import { SupervisorHomeReportList } from "./SupervisorHomeReportList";
import { SupervisorHomeTaskCard } from "./SupervisorHomeTaskCard";
import { SupervisorHomeWeeklyAnalysis } from "./SupervisorHomeWeeklyAnalysis";

function getCurrentWeekRange() {
  const start = new Date(`${getTodayInJakarta()}T00:00:00.000Z`);
  const mondayOffset = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - mondayOffset);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);

  const toDateString = (date: Date) => date.toISOString().slice(0, 10);
  const format = (date: Date) => new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return {
    start: toDateString(start),
    end: toDateString(end),
    label: `${format(start)} – ${format(end)}`,
  };
}

function getGreeting(date: Date): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta",
  }).format(date));
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

function formatIndonesianDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function HomeHeaderContent() {
  const user = useAuthStore((state) => state.user);
  const name = user?.name?.trim() || getRoleLabel(user?.role);
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("id-ID") ?? "")
    .join("");
  const today = new Date();

  return (
    <div className="space-y-1.5 pr-14">
      <div className="flex min-h-12 items-center gap-3">
        <Badge aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 p-0 text-sm font-bold text-white">
          {initials}
        </Badge>
        <div className="min-w-0">
          <p className="text-sm leading-5 text-white/90">{getGreeting(today)},</p>
          <h1 className="truncate text-base font-bold leading-6 tracking-tight">{name}</h1>
        </div>
      </div>
      <p className="text-sm leading-5 text-white/85">{formatIndonesianDate(today)}</p>
    </div>
  );
}

export function SupervisorHomeContent() {
  const week = getCurrentWeekRange();
  const areasQuery = useMyAreasStatusQuery();
  const reportsQuery = useMyReportHistoryQuery({
    page: 1,
    pageSize: 3,
    sortBy: "submittedAt",
    sortOrder: "desc",
  });
  const onTimeReportsQuery = useMyReportHistoryQuery({
    scope: "own",
    dateFrom: week.start,
    dateTo: week.end,
    isLate: false,
    page: 1,
    pageSize: 1,
  });
  const lateReportsQuery = useMyReportHistoryQuery({
    scope: "own",
    dateFrom: week.start,
    dateTo: week.end,
    isLate: true,
    page: 1,
    pageSize: 1,
  });
  const overdueThisWeek = areasQuery.data?.reduce((total, area) => total + area.overdueDates.filter(
    (date) => date >= week.start && date <= week.end,
  ).length, 0) ?? null;
  const analysisLoading = areasQuery.isLoading || onTimeReportsQuery.isLoading || lateReportsQuery.isLoading;
  const analysisError = areasQuery.isError || onTimeReportsQuery.isError || lateReportsQuery.isError;

  function retryWeeklyAnalysis() {
    void Promise.all([
      areasQuery.refetch(),
      onTimeReportsQuery.refetch(),
      lateReportsQuery.refetch(),
    ]);
  }

  return (
    <FieldMainPageLayout headerContent={<HomeHeaderContent />}>
      <div className="space-y-6">
        <SupervisorHomeTaskCard
          areas={areasQuery.data}
          loading={areasQuery.isLoading}
          failed={areasQuery.isError}
          retry={() => void areasQuery.refetch()}
        />
        <SupervisorHomeWeeklyAnalysis
          counts={{
            completed: onTimeReportsQuery.isError ? null : onTimeReportsQuery.data?.meta.totalItems ?? null,
            late: lateReportsQuery.isError ? null : lateReportsQuery.data?.meta.totalItems ?? null,
            overdue: areasQuery.isError ? null : overdueThisWeek,
          }}
          weekLabel={week.label}
          loading={analysisLoading}
          error={analysisError}
          onRetry={retryWeeklyAnalysis}
        />
        <SupervisorHomeReportList
          reports={reportsQuery.data?.data}
          loading={reportsQuery.isLoading}
          failed={reportsQuery.isError}
          retry={() => void reportsQuery.refetch()}
        />
      </div>
    </FieldMainPageLayout>
  );
}
