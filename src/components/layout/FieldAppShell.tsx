"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ClipboardList, FolderKanban, History, House, LogOut, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useLogoutMutation } from "@/hooks/auth.hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

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

const FIELD_TABS = [
  { href: "/field/home", label: "Home", icon: House },
  { href: "/field/reports", label: "Laporan", icon: ClipboardList },
  { href: "/field/history", label: "Riwayat", icon: History },
  { href: "/projects", label: "Project", icon: FolderKanban },
] as const;

export function FieldAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const isHome = pathname === "/field/home";
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  const showNavigation = !pathname.endsWith("/success");

  async function handleLogout(): Promise<void> {
    await logoutMutation.mutateAsync();
    router.replace("/login");
  }

  return (
    <div className="supervisor-mobile relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col bg-canvas shadow-xs">
      <header className={cn(
        "z-30 flex items-center justify-between gap-2",
        isHome
          ? "absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-4 text-white"
          : "sticky top-0 border-b border-border bg-surface px-3 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 sm:px-5 sm:py-4",
      )}>
        {isHome ? (
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/field/home"
              aria-label="Home Supervisor"
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/55"
            >
              <Image src="/brand/archistudio-logo.webp" alt="" width={36} height={36} className="size-9 object-contain" />
            </Link>
            <p className="truncate font-heading text-xl font-bold tracking-tight text-white">ArchiStudio</p>
          </div>
        ) : (
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-text-primary">ArchiStudio</p>
            <p className="truncate text-sm text-text-secondary">
              {user?.name ?? "Pengawas Lapangan"} · Supervisor
            </p>
          </div>
        )}

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {!isHome && <StatusBadge tone={isOnline ? "success" : "danger"} className="max-w-[7rem] px-1.5 sm:max-w-none sm:px-2">
            {isOnline ? <Wifi className="size-3.5" /> : <WifiOff className="size-3.5" />}
            <span className="truncate">{isOnline ? "Online" : "Koneksi Terputus"}</span>
          </StatusBadge>}
          <Button
            type="button"
            variant={isHome ? "ghost" : "outline"}
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className={cn(
              "min-h-12 min-w-12 px-3 text-sm font-medium",
              isHome && "rounded-full bg-black/35 px-4 text-white hover:bg-black/50 hover:text-white",
            )}
            aria-label="Keluar akun"
          >
            <LogOut className="size-4" />
            {isHome && <span className="ml-1">Keluar</span>}
          </Button>
        </div>
      </header>

      <main className={cn(
        "flex-1 text-base text-text-primary",
        isHome ? "p-0" : "px-4 py-6 sm:px-5",
        showNavigation ? "pb-28" : "pb-8",
      )}>
        {children}
      </main>

      {showNavigation && <nav
        aria-label="Navigasi lapangan"
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-30 grid w-[calc(100%-2rem)] max-w-[26.5rem] -translate-x-1/2 grid-cols-4 gap-1 rounded-[2rem] border border-border/80 bg-surface/95 p-2 shadow-[0_12px_32px_rgba(23,38,59,0.14)] backdrop-blur-xl"
      >
        {FIELD_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isActive
                  ? "bg-text-primary text-white shadow-sm"
                  : "text-text-secondary hover:bg-secondary"
              )}
            >
              <Icon className="size-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>}
    </div>
  );
}
