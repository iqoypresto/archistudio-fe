"use client";

import { KeyRound, Pencil, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServerDataTable, type DataColumn } from "@/components/ui/ServerDataTable";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";
import { useAuthStore } from "@/stores/auth.store";
import type { PaginationMeta } from "@/types/api";
import type { UserRole } from "@/types/api/auth.types";
import type { UserListItem } from "@/types/api/user.types";

interface MemberTableProps {
  users: UserListItem[];
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onEdit: (user: UserListItem) => void;
  onResetPassword: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
}

function resolveRoleTone(role: UserRole): StatusTone {
  switch (role) {
    case "OWNER":
      return "info";
    case "ADMIN":
      return "warning";
    case "SUPERVISOR":
      return "muted";
  }
}

export function MemberTable({
  users,
  meta,
  onPageChange,
  onEdit,
  onResetPassword,
  onToggleStatus,
}: MemberTableProps) {
  const currentActor = useAuthStore((state) => state.user);
  const isAdminActor = currentActor?.role === "ADMIN";

  const columns: DataColumn<UserListItem>[] = [
    {
      key: "name",
      header: "Nama & Username",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-text-primary font-medium">{row.name}</span>
          <span className="text-text-secondary text-xs">@{row.username}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Peran",
      cell: (row) => (
        <StatusBadge tone={resolveRoleTone(row.role)}>
          {row.role === "SUPERVISOR"
            ? "Supervisor"
            : row.role === "ADMIN"
              ? "Admin"
              : "Owner"}
        </StatusBadge>
      ),
    },
    {
      key: "contact",
      header: "Kontak & Jabatan",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-text-primary text-sm">{row.phone}</span>
          <span className="text-text-secondary text-xs">{row.jobTitle}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge tone={row.isActive ? "success" : "danger"}>
          {row.isActive ? "Aktif" : "Nonaktif"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cellClassName: "text-right",
      headerClassName: "text-right",
      cell: (row) => {
        const isSelf = row.id === currentActor?.id;
        const isProtectedFromAdmin =
          isAdminActor && (row.role === "OWNER" || row.role === "ADMIN");

        if (isProtectedFromAdmin) {
          return (
            <span className="text-text-secondary text-xs italic">
              Dikelola Owner
            </span>
          );
        }

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-text-secondary hover:text-text-primary"
              onClick={() => onEdit(row)}
              title="Ubah Anggota"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-text-secondary hover:text-text-primary"
              onClick={() => onResetPassword(row)}
              title="Reset Sandi"
            >
              <KeyRound className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-status-danger-fg hover:bg-status-danger-bg/50 disabled:opacity-40"
              onClick={() => onToggleStatus(row)}
              disabled={isSelf}
              title={
                isSelf
                  ? "Tidak dapat menonaktifkan akun sendiri"
                  : row.isActive
                    ? "Nonaktifkan Akun"
                    : "Aktifkan Akun"
              }
            >
              <Power className="size-3.5" />
            </Button>
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
      meta={meta}
      onPageChange={onPageChange}
    />
  );
}
