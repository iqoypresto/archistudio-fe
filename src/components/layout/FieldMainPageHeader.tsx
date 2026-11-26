import type { ReactNode } from "react";
import { SupervisorMainMenu } from "@/components/layout/SupervisorMainMenu";

export function FieldMainPageHeader({ children }: { children: ReactNode }) {
  return (
    <header
      aria-label="Navigasi halaman lapangan"
      className="relative isolate min-h-44 overflow-hidden bg-[var(--project-hero-mid)]"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,var(--project-hero-start)_0%,var(--project-hero-mid)_54%,var(--project-hero-end)_100%)]" />
      <div className="absolute right-4 top-[calc(env(safe-area-inset-top)+1.25rem)] z-20">
        <SupervisorMainMenu />
      </div>
      <div className="relative z-10 px-6 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] text-white">
        {children}
      </div>
    </header>
  );
}
