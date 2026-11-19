export type DashboardStatusFilter = "ALL" | "UNREPORTED" | "LATE" | "OVERDUE_GT_3_DAYS";

export type AreaDailyStatusType = "TERKIRIM" | "TERLAMBAT" | "BELUM_LAPOR" | "LIBUR_RUTIN";

export interface DashboardSupervisorInfo {
  id: string;
  name: string;
  jobTitle: string;
}

export interface DashboardAreaStatusItem {
  areaId: string;
  areaCode: string;
  areaName: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  projectTimezone: string;
  supervisor: DashboardSupervisorInfo | null;
  status: AreaDailyStatusType;
  reportId: string | null;
  reportNumber: string | null;
  submittedAt: string | null;
  isLate: boolean;
  overdueBusinessDaysCount: number;
  isOverdueMoreThan3Days: boolean;
  oldestOverdueDate: string | null;
  latestUnlock: {
    unlockedThroughDate: string;
    reason: string;
  } | null;
}

export interface DashboardKpiMetrics {
  totalProjects: number;
  activeAreas: number;
  reportsSubmittedToday: number;
  areasOverdueMoreThan3Days: number;
}

export interface DashboardSummaryResponse {
  metrics: DashboardKpiMetrics;
  targetDate: string;
  areas: DashboardAreaStatusItem[];
}

export interface SupervisorLatenessItem {
  supervisorId: string;
  supervisorName: string;
  supervisorUsername: string;
  totalReports: number;
  onTimeCount: number;
  lateCount: number;
  onTimePercentage: number;
}

export interface UnlockAreaPayload {
  unlockedThroughDate: string;
  reason?: string;
}

export interface UnlockAreaResponse {
  id: string;
  areaId: string;
  unlockedThroughDate: string;
  reason: string;
  createdAt: string;
  unlockedBy: {
    id: string;
    name: string;
    role: string;
  };
}
