import type { UserRole } from "./auth.types";

export type DashboardStatusFilter = "ALL" | "UNREPORTED" | "LATE" | "OVERDUE_GT_3_DAYS";

export type AreaDailyStatusType =
  | "TERKIRIM"
  | "TERLAMBAT"
  | "BELUM_LAPOR"
  | "LIBUR_RUTIN"
  | "BELUM_DITUGASKAN"
  | "DI_LUAR_JADWAL";

export interface DashboardSupervisorInfo {
  id: string;
  name: string;
  jobTitle: string;
  role?: UserRole;
  isActive?: boolean;
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

export interface DashboardProjectOverview {
  running: number;
  preparing: number;
  completed: number;
  archivedManual: number;
  withoutSiteManager: number;
}

export interface DashboardTeamOverview {
  totalActive: number;
  inactiveCount: number;
  ownerCount: number;
  adminCount: number;
  siteManagerCount: number;
  supervisorCount: number;
  unassignedAreasCount: number;
  areasWithInactiveSupervisorCount: number;
}

export interface DashboardRecentActivityOverview {
  days: number;
  commsInCount: number;
  commsOutCount: number;
  drawingsCount: number;
  documentsCount: number | null;
}

export interface DashboardPaymentOverview {
  unpaidCount: number;
  totalUnpaidAmount: number;
  overdueUnpaidCount: number;
  freelanceUnpaidCount: number;
  agentUnpaidCount: number;
}

export interface DashboardSystemOverview {
  projects: DashboardProjectOverview;
  team: DashboardTeamOverview;
  recentActivity: DashboardRecentActivityOverview;
  payments: DashboardPaymentOverview | null;
}

export interface DashboardSummaryResponse {
  metrics: DashboardKpiMetrics;
  targetDate: string;
  areas: DashboardAreaStatusItem[];
  systemOverview?: DashboardSystemOverview;
}

export interface SupervisorLatenessItem {
  supervisorId: string;
  supervisorName: string;
  supervisorUsername: string;
  supervisorRole?: UserRole;
  supervisorJobTitle?: string;
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
