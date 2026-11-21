"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { LayoutGroup, MotionConfig, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkspaceNavGroup } from "./workspace-nav.config";

export function ProjectNavList({
  groups,
  onNavigate,
  largeTouchTarget = false,
  layoutGroupId = "workspace-sidebar",
  resetKey,
}: {
  groups: WorkspaceNavGroup[];
  onNavigate?: () => void;
  largeTouchTarget?: boolean;
  layoutGroupId?: string;
  resetKey?: string;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [collapseState, setCollapseState] = useState<{ key?: string; values: Record<string, boolean> }>({
    key: resetKey,
    values: {},
  });
  const collapsed = collapseState.key === resetKey ? collapseState.values : {};

  function toggleGroup(groupKey: string): void {
    setCollapseState((current) => {
      const values = current.key === resetKey ? current.values : {};
      return { key: resetKey, values: { ...values, [groupKey]: !values[groupKey] } };
    });
  }

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id={layoutGroupId}>
        <nav className="space-y-5" aria-label="Navigasi workspace">
          {groups.map((group, index) => {
            const groupKey = `${index}:${group.label}`;
            const isOpen = !collapsed[groupKey];
            const groupContentId = `${layoutGroupId}-group-${index}`;

            return (
              <motion.section key={groupKey} layout>
                <Button
                  type="button"
                  variant="ghost"
                  aria-expanded={isOpen}
                  aria-controls={groupContentId}
                  onClick={() => toggleGroup(groupKey)}
                  className={cn(
                    "flex h-auto w-full items-center justify-between rounded-lg px-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted hover:bg-surface-active hover:text-text-primary",
                    largeTouchTarget ? "min-h-12" : "min-h-11",
                  )}
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={cn("size-4 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                </Button>
                <motion.div
                  id={groupContentId}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                  initial={false}
                  animate={isOpen ? "open" : "closed"}
                  variants={{ open: { height: "auto", opacity: 1 }, closed: { height: 0, opacity: 0 } }}
                  transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeInOut" }}
                  className="mt-1.5 space-y-1 overflow-hidden"
                >
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (!item.exact && pathname.startsWith(`${item.href}/`));

                    return (
                      <motion.div key={item.href} layout className="relative rounded-lg">
                        {isActive && (
                          <motion.span
                            layoutId={`active-nav-${layoutGroupId}`}
                            transition={{ type: "spring", bounce: 0.18, duration: reduceMotion ? 0 : 0.3 }}
                            className="absolute inset-0 rounded-lg bg-primary-soft"
                            aria-hidden="true"
                          />
                        )}
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "relative z-10 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors motion-reduce:transition-none",
                            largeTouchTarget ? "min-h-12" : "min-h-11",
                            isActive ? "font-semibold text-text-primary" : "text-text-secondary hover:text-text-primary",
                          )}
                        >
                          <Icon className="size-5 shrink-0" aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.section>
            );
          })}
        </nav>
      </LayoutGroup>
    </MotionConfig>
  );
}
