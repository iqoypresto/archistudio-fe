import { api } from "./axios";
import type { ApiResponse } from "@/types/api";
import type {
  CreateUserPayload,
  PaginatedUsersResponse,
  ResetPasswordPayload,
  ToggleStatusPayload,
  UpdateUserPayload,
  UserFilterParams,
  UserListItem,
} from "@/types/api/user.types";

export const userApi = {
  /** Mengambil daftar anggota berpaginasi beserta filter dan ringkasan global. */
  async getUsers(params?: UserFilterParams): Promise<PaginatedUsersResponse> {
    const response = await api.get<PaginatedUsersResponse>("/office/users", {
      params,
    });
    return response.data;
  },

  /** Membuat akun pengguna baru. */
  async createUser(payload: CreateUserPayload): Promise<UserListItem> {
    const response = await api.post<ApiResponse<UserListItem>>("/office/users", payload);
    return response.data.data;
  },

  /** Memperbarui profil atau role pengguna. */
  async updateUser(
    id: string,
    payload: UpdateUserPayload,
  ): Promise<UserListItem> {
    const response = await api.patch<ApiResponse<UserListItem>>(
      `/office/users/${id}`,
      payload,
    );
    return response.data.data;
  },

  /** Me-reset kata sandi pengguna secara manual. */
  async resetPassword(
    id: string,
    payload: ResetPasswordPayload,
  ): Promise<{ id: string; username: string }> {
    const response = await api.patch<ApiResponse<{ id: string; username: string }>>(
      `/office/users/${id}/reset-password`,
      payload,
    );
    return response.data.data;
  },

  /** Mengubah status aktif/nonaktif akun pengguna. */
  async toggleStatus(
    id: string,
    payload: ToggleStatusPayload,
  ): Promise<{ id: string; isActive: boolean }> {
    const response = await api.patch<ApiResponse<{ id: string; isActive: boolean }>>(
      `/office/users/${id}/status`,
      payload,
    );
    return response.data.data;
  },
};
