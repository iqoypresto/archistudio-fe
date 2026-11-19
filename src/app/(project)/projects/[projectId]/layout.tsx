import type { ReactNode } from "react";
import { ProjectWorkspaceShell } from "@/components/layout/ProjectWorkspaceShell";

export const instant = false;

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectWorkspaceShell projectId={projectId}>{children}</ProjectWorkspaceShell>;
}
