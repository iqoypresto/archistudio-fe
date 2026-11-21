import type { ReactNode } from "react";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";
import { OfficeAppShell } from "@/components/layout/OfficeAppShell";

export const instant = false;

export default function ProjectGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthBootstrap scope="project">
      <OfficeAppShell>{children}</OfficeAppShell>
    </AuthBootstrap>
  );
}
