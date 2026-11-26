import type { ReactNode } from "react";
import { SupervisorMainMenu } from "@/components/layout/SupervisorMainMenu";
import { FieldPageBackButton } from "./FieldPageBackButton";

export function FieldPageHeader({
  children,
  variant = "main",
  prominentTitle = false,
}: {
  children: ReactNode;
  variant?: "main" | "child";
  prominentTitle?: boolean;
}) {
  if (variant === "child") {
    return (
      <header
        aria-label="Navigasi halaman lapangan"
        className="relative isolate min-h-44 overflow-hidden bg-[var(--project-child-hero-mid)]"
      >
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,var(--project-child-hero-start)_0%,var(--project-child-hero-end)_100%)]" />
        <div className="absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)] z-20">
          <SupervisorMainMenu />
        </div>
        <div className="relative z-10 px-4 pb-7 pt-[calc(env(safe-area-inset-top)+1rem)] text-white">
          <div className="flex min-h-12 items-center gap-2 pr-14">
            <FieldPageBackButton />
            <h1 className={`min-w-0 truncate font-heading ${prominentTitle ? "text-xl" : "text-lg"} font-bold leading-tight tracking-tight`}>
              {children}
            </h1>
          </div>
        </div>
      </header>
    );
  }

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
