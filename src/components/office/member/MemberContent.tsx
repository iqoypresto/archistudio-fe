"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageInfoDialog } from "@/components/ui/PageInfoDialog";
import { UnderlineTabsBar } from "@/components/ui/UnderlineTabsNav";
import {
  useCreateUserMutation,
  useResetPasswordMutation,
  useToggleUserStatusMutation,
  useUpdateUserMutation,
  useUsersQuery,
} from "@/hooks/user.hooks";
import type { UserRole } from "@/types/api/auth.types";
import type { UserFilterParams, UserListItem } from "@/types/api/user.types";
import { ConfirmToggleStatusDialog } from "./ConfirmToggleStatusDialog";
import { MemberFilters } from "./MemberFilters";
import { MemberFormModal } from "./MemberFormModal";
import { MemberTable } from "./MemberTable";
import { ResetPasswordModal } from "./ResetPasswordModal";

type RoleTab = "ALL" | UserRole;

const ROLE_TABS: readonly { value: RoleTab; label: string }[] = [
  { value: "ALL", label: "Semua" },
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Admin" },
  { value: "SITE_MANAGER", label: "Site Manager" },
  { value: "SUPERVISOR", label: "Supervisor" },
];

export function MemberContent() {
  const [filters, setFilters] = useState<UserFilterParams>({
    page: 1,
    pageSize: 10,
    sortBy: "name",
    sortOrder: "asc",
  });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserListItem | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<UserListItem | null>(null);
  const [userToToggleStatus, setUserToToggleStatus] = useState<UserListItem | null>(null);

  const usersQuery = useUsersQuery(filters, { keepPreviousData: true });
  const summary = usersQuery.data?.summary;
  const activeCount = summary?.active ?? usersQuery.data?.data.filter((u) => u.isActive).length ?? 0;
  const inactiveCount =
    summary?.inactive ?? usersQuery.data?.data.filter((u) => !u.isActive).length ?? 0;

  const createMutation = useCreateUserMutation(() => setIsFormModalOpen(false));
  const updateMutation = useUpdateUserMutation(() => {
    setIsFormModalOpen(false);
    setUserToEdit(null);
  });
  const resetPasswordMutation = useResetPasswordMutation(() => setUserToResetPassword(null));
  const toggleStatusMutation = useToggleUserStatusMutation(() => setUserToToggleStatus(null));

  const handleFilterChange = (updates: Partial<UserFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 10, sortBy: "name", sortOrder: "asc" });
  };

  const activeRoleTab: RoleTab = filters.role ?? "ALL";

  return (
    <div className="space-y-5">
      <PageHeader
        title="Anggota Tim"
        titleSuffix={
          <PageInfoDialog
            title="Tentang Anggota Tim"
            description="Kelola akun internal, peran pengguna, pengaturan kata sandi, dan status aktif operasional."
          />
        }
        action={
          <Button
            type="button"
            onClick={() => {
              setUserToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="h-9 gap-1.5 text-xs"
          >
            <UserPlus className="size-3.5" />
            Tambah Anggota
          </Button>
        }
      />

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <UnderlineTabsBar
          ariaLabel="Filter peran anggota"
          activeValue={activeRoleTab}
          onChange={(tab) =>
            handleFilterChange({
              role: tab === "ALL" ? undefined : tab,
              page: 1,
            })
          }
          items={ROLE_TABS.map((t) => ({
            ...t,
            count: summary
              ? t.value === "ALL"
                ? summary.total
                : summary.byRole[t.value]
              : t.value === activeRoleTab
                ? usersQuery.data?.meta.totalItems
                : undefined,
          }))}
          rightSlot={
            usersQuery.data
              ? `${activeCount} aktif · ${inactiveCount} nonaktif${summary ? "" : " (halaman ini)"}`
              : undefined
          }
        />

        <div className="p-4 sm:px-5">
          <MemberFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        <AsyncStateView
          isLoading={usersQuery.isLoading}
          isError={usersQuery.isError}
          error={usersQuery.error}
          data={usersQuery.data}
          isEmpty={(res) => res.data.length === 0}
          onRetry={() => usersQuery.refetch()}
          emptyTitle="Belum ada anggota"
          emptyDescription="Tidak ada data anggota tim yang sesuai dengan kriteria filter."
        >
          {(result) => (
            <MemberTable
              users={result.data}
              meta={result.meta}
              onPageChange={(page) => handleFilterChange({ page })}
              onPageSizeChange={(pageSize) => handleFilterChange({ pageSize, page: 1 })}
              isUpdating={usersQuery.isPlaceholderData}
              onEdit={(user) => {
                setUserToEdit(user);
                setIsFormModalOpen(true);
              }}
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
