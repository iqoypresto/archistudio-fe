"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { FieldMainPageContent } from "./FieldMainPageContent";
import { FieldPageHeader } from "./FieldPageHeader";
import { cn } from "@/lib/utils";
import { FieldBottomNavigation } from "./FieldBottomNavigation";

export function FieldAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/field/home";
  const isProjectsHome = pathname === "/field/projects";
  const isMainPage = isHome
    || isProjectsHome
    || pathname === "/field/reports"
    || pathname === "/field/history";
  const showNavigation = isMainPage;

  return (
    <div className="supervisor-mobile project-mobile-shell relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col bg-canvas shadow-xs">
      {!isMainPage && (
        <FieldPageHeader variant="child" prominentTitle={pathname === "/field/reports/new"}>
          {getChildPageTitle(pathname)}
        </FieldPageHeader>
      )}

      <main className={cn(
        "flex-1 text-base text-text-primary",
        isMainPage ? "bg-[var(--project-canvas)] p-0" : "p-0",
        showNavigation
          ? isProjectsHome
            ? "pb-[calc(7rem+env(safe-area-inset-bottom))]"
            : "pb-[calc(6.5rem+env(safe-area-inset-bottom))]"
          : "pb-0",
      )}>
        {isMainPage
          ? children
          : (
            <FieldMainPageContent overlap={pathname === "/field/reports/new" ? "extra-raised" : "standard"}>
              {children}
            </FieldMainPageContent>
          )}
      </main>

      {showNavigation && <FieldBottomNavigation />}
    </div>
  );
}

function getChildPageTitle(pathname: string): string {
  if (pathname === "/field/reports/new") return "Laporan Baru";
  if (pathname.startsWith("/field/reports/")) return "Detail Laporan";
  if (pathname.endsWith("/drawings")) return "Drawing";
  if (pathname.endsWith("/comms/in")) return "Comms In";
  if (pathname.endsWith("/comms/out")) return "Comms Out";
  if (/^\/field\/projects\/[^/]+$/.test(pathname)) return "Detail Project";
  return "Halaman Lapangan";
}
