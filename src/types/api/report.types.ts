import type { PaginatedResponse } from "@/types/api";

export type ReportType = "WORK" | "NO_WORK";
export type ReportStatus = "SUBMITTED";
export type WeatherType = "CERAH" | "BERAWAN" | "HUJAN";

export interface ReportPhotoInput {
  storageKey: string;
  caption?: string | null;
  sortOrder: number;
  takenAt?: string | null;
}

export interface DailyReportPhotoDto {
  id: string;
  storageKey: string;
  signedViewUrl: string;
  caption: string | null;
  sortOrder: number;
  takenAt: string | null;
  uploadedAt: string | null;
}

export interface DailyReportRevisionDto {
  id: string;
  revisionNo: number;
  changeSummary: string;
  previousSnapshotJson: unknown;
  revisedByName: string;
  createdAt: string;
}

export interface DailyReportListItem {
  archivedAt: string | null;
  id: string;
  reportNumber: string;
  reportDate: string;
  reportType: ReportType;
  status: ReportStatus;
  isLate: boolean;
  lateLabel: string | null;
  isRevised: boolean;
  submittedAt: string | null;
  signedByName: string | null;
  signedByTitle: string | null;
  photoCount: number;
  area: { id: string; code: string; name: string };
  project: { id: string; code: string; name: string; timezone: string };
  supervisor: { id: string; name: string; jobTitle: string };
}

export interface DailyReportDetail extends DailyReportListItem {
  progressText: string | null;
  obstaclesText: string | null;
  tomorrowPlanText: string | null;
  weather: WeatherType | null;
  workerCount: number | null;
  noWorkReason: string | null;
  locationText: string | null;
  revisionNo: number;
  revisedAt: string | null;
  photos: DailyReportPhotoDto[];
  revisions: DailyReportRevisionDto[];
}

export interface ListReportsQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  projectId?: string;
  areaId?: string;
  supervisorId?: string;
  reportDate?: string;
  dateFrom?: string;
  dateTo?: string;
  reportType?: ReportType;
  isLate?: boolean;
  sortBy?: "reportDate" | "createdAt" | "submittedAt";
  sortOrder?: "asc" | "desc";
}

export interface ReportRevisionSnapshot {
  reportType: ReportType;
  progressText: string | null;
  obstaclesText: string | null;
  tomorrowPlanText: string | null;
  weather: WeatherType | null;
  workerCount: number | null;
  noWorkReason: string | null;
  locationText: string | null;
  submittedAt: string | null;
  isLate: boolean;
  signedByName: string | null;
  signedByTitle: string | null;
  photos: Array<{
    id: string;
    storageKey: string;
    caption: string | null;
    sortOrder: number;
    takenAt: string | null;
    uploadedAt: string | null;
  }>;
}

export interface ReviseReportPayload extends Omit<SubmitReportPayload, "areaId" | "reportDate" | "photos"> {
  changeSummary: string;
  photos?: ReportPhotoInput[];
}

export interface SubmitReportPayload {
  areaId: string;
  reportDate: string;
  reportType: ReportType;
  progressText?: string | null;
  obstaclesText?: string | null;
  tomorrowPlanText?: string | null;
  weather?: WeatherType | null;
  workerCount?: number | null;
  noWorkReason?: string | null;
  locationText?: string | null;
  photos?: ReportPhotoInput[];
}
export type PaginatedReportsResponse = PaginatedResponse<DailyReportListItem>;

export type ListArchivedReportsQuery = Pick<ListReportsQuery,
  "page" | "pageSize" | "projectId" | "areaId" | "dateFrom" | "dateTo" | "sortBy" | "sortOrder"
>;
export interface ArchivedDailyReportListItem extends DailyReportListItem {
  status: "SUBMITTED";
  archivedAt: string;
}
export type PaginatedArchivedReportsResponse = PaginatedResponse<ArchivedDailyReportListItem>;
