"use client";

import type { ReactNode } from "react";
import { OfficeAppShell } from "./OfficeAppShell";

export function ProjectWorkspaceShell({
  children,
  projectId,
}: {
  children: ReactNode;
  projectId?: string;
}) {
  return <OfficeAppShell projectId={projectId}>{children}</OfficeAppShell>;
}
