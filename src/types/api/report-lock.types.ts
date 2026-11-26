import type { PaginatedResponse } from "@/types/api";

export interface SupervisorAreaTaskStatus {
  areaId: string;
  areaCode: string;
  areaName: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  projectLocation: string;
  timezone: string;
  routineHolidays: number[];
  assignmentStartDate: string;
  assignmentEndDate: string | null;
  pendingDates: string[];
  overdueDates: string[];
  nextRequiredDate: string | null;
  todayDate: string;
  isTodayLocked: boolean;
  isTodayRestDay: boolean;
  isTodaySubmitted: boolean;
  overdueBusinessDaysCount: number;
  isOverdueMoreThan3Days: boolean;
  oldestOverdueDate: string | null;
}

export type SupervisorReportWorkFilter = "ALL" | "LATE" | "OVERDUE";
export type SupervisorReportWorkStatus = "LATE" | "OVERDUE" | "READY" | "WAITING";
export type SupervisorReportWorkAction = "VIEW_REPORT" | "CREATE_REPORT" | "WAIT";

export interface SupervisorReportWorkItem {
  id: string;
  reportId: string | null;
  projectId: string;
  projectName: string;
  areaId: string;
  areaCode: string;
  areaName: string;
  reportDate: string;
  status: SupervisorReportWorkStatus;
  action: SupervisorReportWorkAction;
}

export interface ListMyReportWorkItemsQuery {
  status: SupervisorReportWorkFilter;
  page: number;
  pageSize: number;
}

export type PaginatedSupervisorReportWorkItems = PaginatedResponse<SupervisorReportWorkItem>;
