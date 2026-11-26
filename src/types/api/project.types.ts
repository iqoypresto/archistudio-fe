import type { PaginatedResponse } from "./index";

export type ActiveProjectStatus = "PERSIAPAN" | "BERJALAN";
export type ProjectStatus = ActiveProjectStatus | "SELESAI";
export type ArchiveType = "COMPLETED" | "MANUAL";

export interface ProjectStatusCounts {
  all: number;
  BERJALAN: number;
  PERSIAPAN: number;
}

export interface ProjectSiteManagerSummary {
  id: string;
  name: string;
  phone: string;
}

export interface ProjectListItem {
  id: string;
  code: string;
  name: string;
  location: string;
  clientName: string;
  startDate: string;
  endDate: string | null;
  status: ProjectStatus;
  timezone: string;
  routineHolidays: number[];
  siteManagerId?: string | null;
  siteManager?: ProjectSiteManagerSummary | null;
  completedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    areas: number;
    drawings?: number;
    commsEntries?: number;
    documents?: number;
  };
}

export interface PaginatedProjectsResponse extends PaginatedResponse<ProjectListItem> {
  statusCounts?: ProjectStatusCounts;
}

export interface ProjectAreaSummary {
  id: string;
  code: string;
  name: string;
}

export interface ProjectDetail extends ProjectListItem {
  areas: ProjectAreaSummary[];
}

export interface ArchivedProjectItem extends ProjectListItem {
  archiveType: ArchiveType;
  archiveYear: number;
  archivedActionAt: string;
}

export interface CreateProjectPayload {
  code: string;
  name: string;
  location: string;
  clientName: string;
  startDate: string;
  endDate?: string | null;
  status?: ActiveProjectStatus;
  timezone: string;
  routineHolidays: number[];
  siteManagerId?: string | null;
}

export interface UpdateProjectPayload {
  code?: string;
  name?: string;
  location?: string;
  clientName?: string;
  startDate?: string;
  endDate?: string | null;
  status?: ActiveProjectStatus;
  timezone?: string;
  routineHolidays?: number[];
  siteManagerId?: string | null;
}

export interface RestoreProjectPayload {
  status: ActiveProjectStatus;
}

export interface ProjectFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ActiveProjectStatus;
  sortBy?: "name" | "code" | "startDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface ArchiveFilterParams {
  year?: number;
  search?: string;
}
