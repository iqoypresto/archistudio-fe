"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
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
    <div className="space-y-5">
      <PageHeader
        title="Anggota Tim"
        description="Kelola akun internal, peran pengguna, pengaturan kata sandi, dan status aktif operasional."
        action={
          <Button
            onClick={() => {
              setUserToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="h-9 gap-1.5 text-xs"
          >
            <UserPlus className="size-4" />
            Tambah Anggota
          </Button>
        }
      />

      <section className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
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
      </section>

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
