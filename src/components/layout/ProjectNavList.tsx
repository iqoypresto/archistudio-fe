"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { WorkspaceNavGroup } from "./workspace-nav.config";

export function ProjectNavList({
  groups,
  onNavigate,
  largeTouchTarget = false,
  layoutGroupId = "workspace-sidebar",
  resetKey,
  navLabel = "Navigasi utama",
}: {
  groups: WorkspaceNavGroup[];
  onNavigate?: () => void;
  largeTouchTarget?: boolean;
  layoutGroupId?: string;
  resetKey?: string;
  navLabel?: string;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { open, isMobile, setOpen } = useSidebar();
  const isCollapsed = !open && !isMobile;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id={layoutGroupId}>
        <nav className="space-y-2" aria-label={navLabel}>
          {groups.map((group, groupIndex) => {
            const groupKey = `${resetKey ?? "global"}:${group.label}:${groupIndex}`;
            const activeItem = group.items.find((item) => isItemActive(pathname, item.href, item.exact));
            const groupOpen = openGroups[groupKey] ?? Boolean(activeItem);
            const isOpen = group.collapsible ? !isCollapsed && groupOpen : true;
            const GroupIcon = getGroupIcon(group);
            const controlId = `${layoutGroupId}-group-${groupIndex}`;

            const menuContent = (
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = isItemActive(pathname, item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      {isActive && isOpen && (
                        <motion.span
                          layoutId={`active-nav-${layoutGroupId}`}
                          transition={{ type: "spring", bounce: 0.18, duration: reduceMotion ? 0 : 0.3 }}
                          className="absolute inset-0 rounded-lg bg-primary-soft"
                          aria-hidden="true"
                        />
                      )}
                      <SidebarMenuButton
                        nativeButton={false}
                        render={<Link href={item.href} prefetch={false} onClick={onNavigate} aria-current={isActive ? "page" : undefined} />}
                        isActive={isActive}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(largeTouchTarget && "min-h-12", group.collapsible && "pl-4")}
                      >
                        {Icon && <Icon className="size-5 shrink-0" aria-hidden="true" />}
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            );

            return (
              <SidebarGroup key={groupKey}>
                {group.collapsible ? (
                  <Button
                    type="button"
                    variant="ghost"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? controlId : undefined}
                    onClick={() => {
                      if (isCollapsed) {
                        setOpen(true);
                        setOpenGroups((current) => ({ ...current, [groupKey]: true }));
                        return;
                      }
                      setOpenGroups((current) => ({ ...current, [groupKey]: !isOpen }));
                    }}
                    title={isCollapsed ? group.label : undefined}
                    className={cn(
                      "flex min-h-11 w-full items-center justify-start gap-3 rounded-lg px-3 text-left text-xs font-semibold uppercase tracking-wide text-text-muted hover:bg-surface-active hover:text-text-primary",
                      largeTouchTarget && "min-h-12",
                      isCollapsed && "justify-center px-0",
                      isCollapsed && Boolean(activeItem) && "bg-primary-soft text-text-primary",
                    )}
                  >
                    {GroupIcon && <GroupIcon className="size-5 shrink-0" aria-hidden="true" />}
                    {!isCollapsed && <span className="flex-1 truncate">{group.label}</span>}
                    {!isCollapsed && (
                      <ChevronDown className={cn("size-4 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} />
                    )}
                  </Button>
                ) : group.showLabel !== false ? (
                  <SidebarGroupLabel>
                    {GroupIcon && <GroupIcon className="size-4 shrink-0" aria-hidden="true" />}
                    {group.label}
                  </SidebarGroupLabel>
                ) : null}
                {group.collapsible ? (
                  !isCollapsed ? (
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={controlId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeInOut" }}
                          className="mt-1 overflow-hidden"
                        >
                          {menuContent}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ) : null
                ) : (
                  menuContent
                )}
              </SidebarGroup>
            );
          })}
        </nav>
      </LayoutGroup>
    </MotionConfig>
  );
}

function getGroupIcon(group: WorkspaceNavGroup): LucideIcon | undefined {
  return group.icon ?? group.items.find((item) => item.icon)?.icon;
}

function isItemActive(pathname: string, href: string, exact?: boolean): boolean {
  return pathname === href || (!exact && pathname.startsWith(`${href}/`));
}
