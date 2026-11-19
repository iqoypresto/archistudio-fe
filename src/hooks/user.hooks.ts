import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userApi } from "@/lib/api/user.api";
import type {
  CreateUserPayload,
  ResetPasswordPayload,
  ToggleStatusPayload,
  UpdateUserPayload,
  UserFilterParams,
} from "@/types/api/user.types";

export const USERS_QUERY_KEY = ["users"] as const;

export function useUsersQuery(
  params: UserFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, params],
    queryFn: () => userApi.getUsers(params),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateUserMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userApi.createUser(payload),
    onSuccess: () => {
      toast.success("Akun pengguna berhasil dibuat.");
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat pengguna.");
    },
  });
}

export function useUpdateUserMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userApi.updateUser(id, payload),
    onSuccess: () => {
      toast.success("Data pengguna berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui pengguna.");
    },
  });
}

export function useResetPasswordMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResetPasswordPayload }) =>
      userApi.resetPassword(id, payload),
    onSuccess: (data: { id: string; username: string }) => {
      toast.success(`Kata sandi akun ${data.username} berhasil di-reset.`);
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal me-reset kata sandi.");
    },
  });
}

export function useToggleUserStatusMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ToggleStatusPayload }) =>
      userApi.toggleStatus(id, payload),
    onSuccess: (data: { id: string; isActive: boolean }) => {
      toast.success(
        data.isActive
          ? "Akun pengguna berhasil diaktifkan kembali."
          : "Akun pengguna telah dinonaktifkan.",
      );
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengubah status akun.");
    },
  });
}
