import type { PaginatedResponse } from "@/types/api";

export type ReportType = "WORK" | "NO_WORK";
export type ReportStatus = "DRAFT" | "SUBMITTED";
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
  id: string;
  reportNumber: string;
  reportDate: string;
  reportType: ReportType;
  status: ReportStatus;
  isLate: boolean;
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
  projectId?: string;
  areaId?: string;
  status?: ReportStatus;
  reportType?: ReportType;
  isLate?: boolean;
}

export interface SaveDraftPayload {
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

export type UpdateDraftPayload = Omit<SaveDraftPayload, "areaId" | "reportDate">;
export type PaginatedReportsResponse = PaginatedResponse<DailyReportListItem>;
