import type { ReactNode } from "react";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";

export const instant = false;

export default function ProjectGroupLayout({ children }: { children: ReactNode }) {
  return <AuthBootstrap scope="project">{children}</AuthBootstrap>;
}
