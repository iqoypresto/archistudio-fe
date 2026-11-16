"use client";

import { useState } from "react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import {
  useCreateUserMutation,
  useResetPasswordMutation,
  useToggleUserStatusMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "@/hooks/user.hooks";
import type { UserFilterParams, UserListItem } from "@/types/api/user.types";
import { ConfirmToggleStatusDialog } from "./ConfirmToggleStatusDialog";
import { MemberFilters } from "./MemberFilters";
import { MemberFormModal } from "./MemberFormModal";
import { MemberTable } from "./MemberTable";
import { ResetPasswordModal } from "./ResetPasswordModal";

export function MemberContent() {
  const [filters, setFilters] = useState<UserFilterParams>({
    page: 1,
    pageSize: 10,
  });

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserListItem | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<UserListItem | null>(null);
  const [userToToggleStatus, setUserToToggleStatus] = useState<UserListItem | null>(null);

  const usersQuery = useUsersQuery(filters);

  const createMutation = useCreateUserMutation(() => setIsFormModalOpen(false));
  const updateMutation = useUpdateUserMutation(() => {
    setIsFormModalOpen(false);
    setUserToEdit(null);
  });
  const resetPasswordMutation = useResetPasswordMutation(() =>
    setUserToResetPassword(null),
  );
  const toggleStatusMutation = useToggleUserStatusMutation(() =>
    setUserToToggleStatus(null),
  );

  const handleFilterChange = (updates: Partial<UserFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 10 });
  };

  const handleOpenEdit = (user: UserListItem) => {
    setUserToEdit(user);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <MemberFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onOpenCreateModal={() => {
          setUserToEdit(null);
          setIsFormModalOpen(true);
        }}
      />

      <AsyncStateView
        isLoading={usersQuery.isLoading}
        isError={usersQuery.isError}
        error={usersQuery.error}
        data={usersQuery.data}
        onRetry={() => usersQuery.refetch()}
        emptyTitle="Belum ada anggota"
        emptyDescription="Tidak ada data anggota tim yang sesuai dengan kriteria filter."
      >
        {(result) => (
          <MemberTable
            users={result.data}
            meta={result.meta}
            onPageChange={(page) => handleFilterChange({ page })}
            onEdit={handleOpenEdit}
            onResetPassword={(user) => setUserToResetPassword(user)}
            onToggleStatus={(user) => setUserToToggleStatus(user)}
          />
        )}
      </AsyncStateView>

      <MemberFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setUserToEdit(null);
        }}
        userToEdit={userToEdit}
        onSubmitCreate={(data) => createMutation.mutate(data)}
        onSubmitUpdate={(id, data) => updateMutation.mutate({ id, payload: data })}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <ResetPasswordModal
        isOpen={Boolean(userToResetPassword)}
        onClose={() => setUserToResetPassword(null)}
        targetUser={userToResetPassword}
        onSubmit={(userId, newPassword) =>
          resetPasswordMutation.mutate({ id: userId, payload: { newPassword } })
        }
        isSubmitting={resetPasswordMutation.isPending}
      />

      <ConfirmToggleStatusDialog
        isOpen={Boolean(userToToggleStatus)}
        onClose={() => setUserToToggleStatus(null)}
        targetUser={userToToggleStatus}
        onConfirm={(userId, isActive) =>
          toggleStatusMutation.mutate({ id: userId, payload: { isActive } })
        }
        isSubmitting={toggleStatusMutation.isPending}
      />
    </div>
  );
}
