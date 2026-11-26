"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FIELD_BOTTOM_TABS } from "./field-bottom-nav.config";

export function FieldBottomNavigation() {
  const pathname = usePathname();
  const isReportDetail = pathname.startsWith("/field/reports/") && pathname !== "/field/reports/new";

  return (
    <nav
      aria-label="Navigasi lapangan"
      className="field-bottom-navigation fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-30 grid min-h-[5.125rem] w-[calc(100%-2rem)] max-w-[26.5rem] -translate-x-1/2 grid-cols-4 gap-1 rounded-[1.875rem] border p-2 shadow-[var(--field-nav-shadow)]"
    >
      {FIELD_BOTTOM_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.href === "/field/history"
          ? pathname === tab.href || isReportDetail
          : tab.href === "/field/reports"
            ? pathname === tab.href || pathname === "/field/reports/new"
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-[1.4375rem] text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              isActive
                ? "bg-gradient-to-br from-[var(--field-nav-active-start)] to-[var(--field-nav-active-end)] text-white shadow-sm"
                : "text-[var(--field-nav-text)] hover:bg-[var(--field-nav-hover)]"
            }`}
          >
            <Icon className="size-[1.375rem] shrink-0" aria-hidden="true" />
            <span className="max-w-full whitespace-normal break-words text-center leading-tight">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
