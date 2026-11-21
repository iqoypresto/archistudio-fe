import type { ReactNode } from "react";

export const instant = false;

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
