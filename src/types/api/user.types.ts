import type { PaginatedResponse } from "./index";
import type { UserRole } from "./auth.types";

export interface UserListItem {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: UserRole;
  jobTitle: string;
  isActive: boolean;
  activeAreaCount?: number;
  managedProjectCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummaryCount {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<UserRole, number>;
}

export interface PaginatedUsersResponse extends PaginatedResponse<UserListItem> {
  summary?: UserSummaryCount;
}

export interface CreateUserPayload {
  name: string;
  username: string;
  phone: string;
  password: string;
  role: "ADMIN" | "SITE_MANAGER" | "SUPERVISOR";
  jobTitle?: string;
}

export interface UpdateUserPayload {
  name?: string;
  username?: string;
  phone?: string;
  role?: "ADMIN" | "SITE_MANAGER" | "SUPERVISOR";
  jobTitle?: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
}

export interface ToggleStatusPayload {
  isActive: boolean;
}

export interface UserFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy?: "name" | "username" | "createdAt";
  sortOrder?: "asc" | "desc";
}
