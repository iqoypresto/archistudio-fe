"use client";

import type { ReactNode } from "react";
import { isFieldRole } from "@/lib/utils/role";
import { useAuthStore } from "@/stores/auth.store";
import { FieldAppShell } from "./FieldAppShell";
import { OfficeAppShell } from "./OfficeAppShell";

export function ProjectRoleShell({ children }: { children: ReactNode }) {
  const role = useAuthStore((state) => state.user?.role);
  return isFieldRole(role) ? (
    <FieldAppShell>{children}</FieldAppShell>
  ) : (
    <OfficeAppShell>{children}</OfficeAppShell>
  );
}
