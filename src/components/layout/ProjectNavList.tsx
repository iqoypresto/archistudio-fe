"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const navigationId = useId();
  const [collapsedAtPath, setCollapsedAtPath] = useState<Record<string, string>>({});

  function toggleGroup(label: string): void {
    setCollapsedAtPath((current) => {
      const next = { ...current };
      if (next[label] === pathname) delete next[label];
      else next[label] = pathname;
      return next;
    });
  }

  return (
    <nav className="space-y-5" aria-label="Navigasi workspace">
      {groups.map((group, index) => {
        const groupKey = `${index}:${group.label}`;
        const isOpen = collapsedAtPath[groupKey] !== pathname;
        const groupContentId = `${navigationId}-group-${index}`;
        return (
          <section key={groupKey}>
            <button
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
            </button>
            <div id={groupContentId} hidden={!isOpen} className="mt-1.5 space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      largeTouchTarget ? "min-h-12" : "min-h-11",
                      isActive ? "bg-primary-soft font-semibold text-text-primary" : "text-text-secondary hover:bg-surface-active hover:text-text-primary",
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </nav>
  );
}
