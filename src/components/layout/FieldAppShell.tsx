"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Wifi, WifiOff } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { getRoleLabel } from "@/lib/utils/role";
import { useAuthStore } from "@/stores/auth.store";
import { FieldBottomNavigation } from "./FieldBottomNavigation";
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
  const isMainPage = isHome
    || isProjectsHome
    || pathname === "/field/reports"
    || pathname === "/field/history";
  const user = useAuthStore((state) => state.user);
  const showNavigation = !pathname.endsWith("/success");

  return (
    <div className={cn("supervisor-mobile relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col bg-canvas shadow-xs", isMainPage && "project-mobile-shell")}>
      {!isMainPage && <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border bg-surface px-3 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 sm:px-5 sm:py-4">
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
        isMainPage ? "bg-[var(--project-canvas)] p-0" : "px-4 py-6 sm:px-5",
        showNavigation
          ? isProjectsHome
            ? "pb-[calc(7rem+env(safe-area-inset-bottom))]"
            : "pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
          : "pb-8",
      )}>
        {children}
      </main>

      {showNavigation && <FieldBottomNavigation />}
    </div>
  );
}
