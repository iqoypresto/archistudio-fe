"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FolderKanban } from "lucide-react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
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
import type { UserRole } from "@/types/api/auth.types";
import type { ProjectListItem } from "@/types/api/project.types";
import { ProjectNavList } from "./ProjectNavList";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { getProjectNavGroups } from "./workspace-nav.config";

export function ProjectNavigation({
  projectId,
  activeProject,
  role,
  onNavigate,
  largeTouchTarget = false,
  layoutGroupId = "project-navigation",
}: {
  projectId?: string;
  activeProject?: ProjectListItem | null;
  role: UserRole;
  onNavigate?: () => void;
  largeTouchTarget?: boolean;
  layoutGroupId?: string;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const { open, isMobile, setOpen } = useSidebar();
  const isCollapsed = !open && !isMobile;
  const isCurrentProject = Boolean(projectId && pathname.startsWith(`/projects/${projectId}`));
  const isProjectList = pathname === "/projects";
  const isActive = isCurrentProject || isProjectList;
  const [sectionState, setSectionState] = useState<{ key: string; open: boolean } | null>(null);
  const sectionOpen = sectionState?.key === (projectId ?? "project-list") ? sectionState.open : false;
  const isOpen = !isCollapsed && sectionOpen;
  const projectGroups = projectId ? getProjectNavGroups(projectId, role) : [];

  function toggleSection(): void {
    if (isCollapsed) setOpen(true);
    else setSectionState({ key: projectId ?? "project-list", open: !isOpen });
  }

  return (
    <MotionConfig reducedMotion="user">
      <SidebarGroup className="border-t border-border pt-3">
        <SidebarGroupLabel className="sr-only">Project</SidebarGroupLabel>
        <Button
          type="button"
          variant="ghost"
          aria-expanded={isOpen}
          aria-controls={`${layoutGroupId}-panel`}
          onClick={toggleSection}
          title={isCollapsed ? "Project" : undefined}
          className={cn(
            "flex min-h-11 w-full items-center justify-start gap-3 rounded-lg px-3 text-sm font-semibold text-text-primary hover:bg-surface-active",
            largeTouchTarget && "min-h-12",
            isActive && "bg-primary-soft",
            isCollapsed && "justify-center px-0",
          )}
        >
          <FolderKanban className="size-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span className="flex-1 text-left">Project</span>}
          {!isCollapsed && (
            <ChevronDown className={cn("size-4 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} />
          )}
        </Button>
        <motion.div
          id={`${layoutGroupId}-panel`}
          aria-hidden={!isOpen}
          inert={!isOpen}
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={{ open: { height: "auto", opacity: 1 }, closed: { height: 0, opacity: 0 } }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeInOut" }}
          className="ml-3 mt-1 overflow-hidden border-l border-border pl-3"
        >
          {isOpen && <ProjectSwitcher activeProject={activeProject} onNavigate={onNavigate} compact />}
          <SidebarMenu className="mt-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                nativeButton={false}
                render={<Link href="/projects" prefetch={false} onClick={onNavigate} aria-current={isProjectList ? "page" : undefined} />}
                isActive={isProjectList}
                title={isCollapsed ? "Semua Project" : undefined}
              >
                <FolderKanban className="size-5 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span className="truncate">Semua Project</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          {projectId && isOpen ? (
            <div className="ml-3 mt-1 border-l border-border pl-3">
              <ProjectNavList
                groups={projectGroups}
                onNavigate={onNavigate}
                largeTouchTarget={largeTouchTarget}
                layoutGroupId={`${layoutGroupId}-details`}
                resetKey={projectId}
              />
            </div>
          ) : !projectId && isOpen ? (
            <p className="px-3 py-2 text-xs text-text-muted">Pilih project untuk membuka menunya.</p>
          ) : null}
        </motion.div>
      </SidebarGroup>
    </MotionConfig>
  );
}
