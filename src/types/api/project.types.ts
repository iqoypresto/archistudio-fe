export type ProjectStatus = "PERSIAPAN" | "BERJALAN" | "SELESAI";

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

export interface ProjectAreaSummary {
  id: string;
  code: string;
  name: string;
}

export interface ProjectDetail extends ProjectListItem {
  areas: ProjectAreaSummary[];
}

export interface CreateProjectPayload {
  code: string;
  name: string;
  location: string;
  clientName: string;
  startDate: string;
  endDate?: string | null;
  status?: ProjectStatus;
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
  status?: ProjectStatus;
  timezone?: string;
  routineHolidays?: number[];
}

export interface ProjectFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ProjectStatus;
  sortBy?: "name" | "code" | "startDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}
