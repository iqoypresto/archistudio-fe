import type { ReactNode } from "react";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";
import { ProjectRoleShell } from "@/components/layout/ProjectRoleShell";

export const instant = false;

export default function ProjectGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthBootstrap scope="project">
      <ProjectRoleShell>{children}</ProjectRoleShell>
    </AuthBootstrap>
  );
}
