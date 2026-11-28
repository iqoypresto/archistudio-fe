"use client";

import { Button } from "@/components/ui/button";
import { ServerDataTable, type DataColumn } from "@/components/ui/ServerDataTable";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { getRoleLabel } from "@/lib/utils/role";
import { useAuthStore } from "@/stores/auth.store";
import type { PaginationMeta } from "@/types/api";
import type { UserListItem } from "@/types/api/user.types";

interface MemberTableProps {
  users: UserListItem[];
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isUpdating?: boolean;
  onEdit: (user: UserListItem) => void;
  onResetPassword: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
}

export function MemberTable({
  users,
  meta,
  onPageChange,
  onPageSizeChange,
  isUpdating = false,
  onEdit,
  onResetPassword,
  onToggleStatus,
}: MemberTableProps) {
  const currentActor = useAuthStore((state) => state.user);
  const isAdminActor = currentActor?.role === "ADMIN";

  const columns: DataColumn<UserListItem>[] = [
    {
      key: "name",
      header: "Anggota",
      cell: (row) => {
        const isSelf = row.id === currentActor?.id;
        return (
          <div className="space-y-0.5">
            <p className="text-[13px] font-medium text-text-primary">
              {row.name}
              {isSelf && <span className="ml-1.5 text-xs font-normal text-text-muted">(Anda)</span>}
            </p>
            <p className="text-xs text-text-muted">@{row.username}</p>
          </div>
        );
      },
    },
    {
      key: "role",
      header: "Peran & Jabatan",
      cell: (row) => {
        const workloadParts: string[] = [];
        if (row.managedProjectCount) workloadParts.push(`${row.managedProjectCount} proyek`);
        if (row.activeAreaCount) workloadParts.push(`${row.activeAreaCount} area aktif`);
        return (
          <div className="space-y-0.5">
            <p className="text-[13px] font-medium text-text-primary">{getRoleLabel(row.role)}</p>
            <p className="text-xs text-text-muted">
              {row.jobTitle || "-"}
              {workloadParts.length > 0 ? ` · ${workloadParts.join(" · ")}` : ""}
            </p>
          </div>
        );
      },
    },
    {
      key: "phone",
      header: "Nomor HP",
      cell: (row) => <span className="text-[13px] text-text-secondary">{row.phone || "-"}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusIndicator tone={row.isActive ? "success" : "muted"}>
          {row.isActive ? "Aktif" : "Nonaktif"}
        </StatusIndicator>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => {
        const isSelf = row.id === currentActor?.id;
        const isProtectedFromAdmin = isAdminActor && row.role !== "SUPERVISOR";

        if (isProtectedFromAdmin) {
          return <span className="text-xs text-text-muted">Dikelola Owner</span>;
        }

        return (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary"
              onClick={() => onEdit(row)}
            >
              Ubah
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary"
              onClick={() => onResetPassword(row)}
            >
              Reset Sandi
            </Button>
            {!isSelf && (
              <Button
                type="button"
                variant={row.isActive ? "destructive" : "outline"}
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => onToggleStatus(row)}
              >
                {row.isActive ? "Nonaktifkan" : "Aktifkan"}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <ServerDataTable
      columns={columns}
      data={users}
      getRowKey={(row) => row.id}
      getRowClassName={(row) => (!row.isActive ? "opacity-60" : undefined)}
      meta={meta}
      bare
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      isUpdating={isUpdating}
    />
  );
}
