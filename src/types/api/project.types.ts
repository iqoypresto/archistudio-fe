export type ActiveProjectStatus = "PERSIAPAN" | "BERJALAN";
export type ProjectStatus = ActiveProjectStatus | "SELESAI";
export type ArchiveType = "COMPLETED" | "MANUAL";

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
  completedAt?: string | null;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    areas: number;
  };
}

export interface ProjectOption {
  id: string;
  code: string;
  name: string;
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
