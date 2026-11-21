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
    <nav className="space-y-4" aria-label="Navigasi workspace">
      {groups.map((group, index) => {
        const groupKey = `${index}:${group.label}`;
        const isOpen = collapsedAtPath[groupKey] !== pathname;
        const groupContentId = `${navigationId}-group-${index}`;
        return (
          <section
            key={groupKey}
            className={cn(index > 0 && "border-t border-sidebar-border pt-3")}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={groupContentId}
              onClick={() => toggleGroup(groupKey)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 text-left text-[11px] font-medium tracking-wider text-text-muted uppercase transition-colors hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                largeTouchTarget ? "min-h-12" : "h-7",
              )}
            >
              <span>{group.label}</span>
              <ChevronDown
                className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
                aria-hidden="true"
              />
            </button>
            <div id={groupContentId} hidden={!isOpen} className="mt-1 space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (!item.exact && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                      largeTouchTarget ? "min-h-12" : "min-h-9",
                      isActive
                        ? "bg-surface-active font-medium text-text-primary shadow-2xs ring-1 ring-white/[0.06]"
                        : "font-normal text-text-secondary hover:bg-surface-active/60 hover:text-text-primary",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        isActive ? "text-text-primary" : "text-text-muted",
                      )}
                    />
                    <span className="truncate">{item.label}</span>
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
