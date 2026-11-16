import type { UserRole } from "./auth.types";

export interface UserListItem {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: UserRole;
  jobTitle: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  username: string;
  phone: string;
  password: string;
  role: "ADMIN" | "SUPERVISOR";
  jobTitle?: string;
}

export interface UpdateUserPayload {
  name?: string;
  username?: string;
  phone?: string;
  role?: "ADMIN" | "SUPERVISOR";
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
