"use client";

import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { getRoleLabel } from "@/lib/utils/role";
import type { UserListItem } from "@/types/api/user.types";

interface MemberMobileCardProps {
  row: UserListItem;
  isSelf: boolean;
  isProtectedFromAdmin: boolean;
  onEdit: (user: UserListItem) => void;
  onResetPassword: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
}

export function MemberMobileCard({
  row,
  isSelf,
  isProtectedFromAdmin,
  onEdit,
  onResetPassword,
  onToggleStatus,
}: MemberMobileCardProps) {
  const workloadParts: string[] = [];
  if (row.managedProjectCount) workloadParts.push(`${row.managedProjectCount} proyek`);
  if (row.activeAreaCount) workloadParts.push(`${row.activeAreaCount} area aktif`);

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">
            {row.name}
            {isSelf && <span className="ml-1.5 text-xs font-normal text-text-muted">(Anda)</span>}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">@{row.username} · {row.phone || "Tanpa HP"}</p>
        </div>
        <StatusIndicator tone={row.isActive ? "success" : "muted"} className="shrink-0 text-xs">
          {row.isActive ? "Aktif" : "Nonaktif"}
        </StatusIndicator>
      </div>

      <p className="text-xs text-text-secondary">
        <strong className="font-medium text-text-primary">{getRoleLabel(row.role)}</strong>
        {row.jobTitle ? ` · ${row.jobTitle}` : ""}
        {workloadParts.length > 0 ? ` · ${workloadParts.join(" · ")}` : ""}
      </p>

      {isProtectedFromAdmin ? (
        <p className="text-xs text-text-muted">Dikelola Owner</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" size="sm" className="h-10 text-xs" onClick={() => onEdit(row)}>
            Ubah
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-10 text-xs" onClick={() => onResetPassword(row)}>
            Reset Sandi
          </Button>
          {!isSelf && (
            <Button
              type="button"
              variant={row.isActive ? "destructive" : "outline"}
              size="sm"
              className="col-span-2 h-10 text-xs"
              onClick={() => onToggleStatus(row)}
            >
              {row.isActive ? "Nonaktifkan Akun" : "Aktifkan Akun"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
