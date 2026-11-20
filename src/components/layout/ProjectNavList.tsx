"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkspaceNavGroup } from "./workspace-nav.config";

export function ProjectNavList({
  groups,
  onNavigate,
  largeTouchTarget = false,
}: {
  groups: WorkspaceNavGroup[];
  onNavigate?: () => void;
  largeTouchTarget?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigationId = useId();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggleGroup(label: string): void {
    setCollapsed((current) => ({ ...current, [label]: !current[label] }));
  }

  return (
    <nav className="space-y-5" aria-label="Navigasi workspace">
      {groups.map((group, index) => {
        const groupKey = `${index}:${group.label}`;
        const isOpen = group.label ? !collapsed[groupKey] : true;
        const groupContentId = `${navigationId}-group-${index}`;
        return (
          <section key={groupKey}>
            {group.label && <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={groupContentId}
              onClick={() => toggleGroup(groupKey)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted transition-colors hover:bg-surface-active hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
                largeTouchTarget ? "min-h-12" : "min-h-11",
              )}
            >
              <span>{group.label}</span>
              <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} aria-hidden="true" />
            </button>}
            <div id={groupContentId} hidden={!isOpen} className="mt-1.5 space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`));
                const currentUrl = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ""}`;
                const isItemOpen = item.children?.some((child) => currentUrl === child.href || pathname === child.href.split("?")[0]) ?? false;
                const itemOpen = collapsed[item.label] === undefined ? isItemOpen : !collapsed[item.label];
                return (
                  <div key={item.label}>
                    <div className={cn("flex items-center rounded-lg", isActive && "bg-primary-soft")}>
                      <Link href={item.href} onClick={onNavigate} aria-current={isActive ? "page" : undefined} className={cn("flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-sm font-medium", largeTouchTarget ? "min-h-12" : "min-h-11", isActive ? "font-semibold text-text-primary" : "text-text-secondary hover:text-text-primary")}>
                        <Icon className="size-5 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                      {item.children && <button type="button" onClick={() => toggleGroup(item.label)} aria-label={`${itemOpen ? "Tutup" : "Buka"} ${item.label}`} aria-expanded={itemOpen} className="grid size-10 shrink-0 place-items-center rounded-lg text-text-secondary hover:bg-surface-active"><ChevronDown className={cn("size-4 transition-transform", itemOpen && "rotate-180")} /></button>}
                    </div>
                    {item.children && <div hidden={!itemOpen} className="ml-5 mt-1 space-y-1 border-l border-border pl-3">
                      {item.children.map((child) => <Link key={child.label} href={child.href} onClick={onNavigate} aria-current={currentUrl === child.href ? "page" : undefined} className={cn("flex min-h-10 items-center rounded-lg px-3 text-sm text-text-secondary hover:bg-surface-active hover:text-text-primary motion-reduce:transition-none", currentUrl === child.href && "bg-surface-active text-text-primary")}>{child.label}</Link>)}
                    </div>}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </nav>
  );
}
