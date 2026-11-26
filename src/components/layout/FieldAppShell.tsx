"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wifi, WifiOff } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { getRoleLabel } from "@/lib/utils/role";
import { useAuthStore } from "@/stores/auth.store";
import { FIELD_BOTTOM_TABS } from "./field-bottom-nav.config";
import { SupervisorMainMenu } from "./SupervisorMainMenu";

function subscribeOnlineStatus(callback: () => void): () => void {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribeOnlineStatus,
    () => navigator.onLine,
    () => true
  );
}

export function FieldAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isOnline = useOnlineStatus();
  const isHome = pathname === "/field/home";
  const isProjectsHome = pathname === "/field/projects";
  const isLandingPage = isHome || isProjectsHome;
  const isReportDetail = pathname.startsWith("/field/reports/") && pathname !== "/field/reports/new";
  const user = useAuthStore((state) => state.user);
  const showNavigation = !pathname.endsWith("/success");

  return (
    <div className={cn("supervisor-mobile relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col bg-canvas shadow-xs", isLandingPage && "project-mobile-shell")}>
      {!isLandingPage && <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-surface px-3 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-text-primary">ArchiStudio</p>
            <p className="truncate text-sm text-text-secondary">
              {user?.name ?? "Pengawas Lapangan"} · {getRoleLabel(user?.role)}
            </p>
          </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <StatusBadge tone={isOnline ? "success" : "danger"} className="max-w-[7rem] px-1.5 sm:max-w-none sm:px-2">
            {isOnline ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
            <span className="truncate">{isOnline ? "Online" : "Koneksi Terputus"}</span>
          </StatusBadge>
          {showNavigation && <SupervisorMainMenu tone="surface" />}
        </div>
      </header>}

      <main className={cn(
        "flex-1 text-base text-text-primary",
        isLandingPage ? "bg-[var(--project-canvas)] p-0" : "px-4 py-6 sm:px-5",
        showNavigation
          ? isProjectsHome
            ? "pb-[calc(7rem+env(safe-area-inset-bottom))]"
            : "pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
          : "pb-8",
      )}>
        {children}
      </main>

      {showNavigation && <nav
        aria-label="Navigasi lapangan"
        className={cn(
          "fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-30 grid w-[calc(100%-2rem)] max-w-[26.5rem] -translate-x-1/2 grid-cols-4 gap-1 p-2 backdrop-blur-xl",
          isLandingPage
            ? "min-h-[5.125rem] rounded-[1.875rem] border border-[var(--project-nav-border)] bg-[var(--project-nav-surface)] shadow-[var(--project-nav-shadow)]"
            : "rounded-[2rem] border border-border/80 bg-surface/95 shadow-sm",
        )}
      >
        {FIELD_BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === "/field/history"
            ? pathname === tab.href || isReportDetail
            : tab.href === "/field/reports"
              ? pathname === tab.href || (pathname.startsWith(`${tab.href}/`) && !isReportDetail)
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isLandingPage
                  ? "min-h-16 min-w-0 rounded-[1.4375rem] text-sm"
                  : "min-h-14 rounded-2xl text-xs",
                isActive
                  ? isLandingPage
                    ? "bg-gradient-to-br from-[var(--project-nav-active-start)] to-[var(--project-nav-active-end)] text-white shadow-sm"
                    : "bg-primary-soft text-primary"
                  : isProjectsHome
                    ? "text-[var(--project-nav-text)] hover:bg-[var(--project-nav-hover)]"
                    : isHome
                      ? "text-[var(--project-nav-text)] hover:bg-[var(--project-nav-hover)]"
                      : "text-text-secondary hover:bg-secondary"
              )}
            >
              <Icon className={isLandingPage ? "size-[1.375rem] shrink-0" : "size-5"} />
              <span className={isLandingPage ? "max-w-full whitespace-normal break-words text-center leading-tight" : undefined}>{tab.label}</span>
            </Link>
          );
        })}
      </nav>}
    </div>
  );
}
