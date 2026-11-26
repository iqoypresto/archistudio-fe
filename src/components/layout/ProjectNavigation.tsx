"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FolderKanban } from "lucide-react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
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
import { isFieldRole } from "@/lib/utils/role";
import {
  isProjectRoutePath,
  resolveProjectSectionOpen,
  useSidebarNavStore,
} from "@/stores/sidebar-nav.store";
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
  const projectRoot = isFieldRole(role) ? "/field/projects" : "/office/projects";
  const isCurrentProject = Boolean(projectId && pathname.startsWith(`${projectRoot}/${projectId}`));
  const isProjectList = pathname === projectRoot;
  const isActive = isCurrentProject || isProjectList;
  const isProjectRoute = isProjectRoutePath(pathname);
  const projectSectionPreference = useSidebarNavStore((state) => state.projectSectionPreference);
  const lastRouteWasProject = useSidebarNavStore((state) => state.lastRouteWasProject);
  const setProjectSectionOpen = useSidebarNavStore((state) => state.setProjectSectionOpen);
  const syncProjectRoute = useSidebarNavStore((state) => state.syncProjectRoute);

  useEffect(() => {
    syncProjectRoute(isProjectRoute);
  }, [isProjectRoute, syncProjectRoute]);

  const sectionOpen = resolveProjectSectionOpen(
    projectSectionPreference,
    isProjectRoute,
    lastRouteWasProject,
  );
  const isOpen = !isCollapsed && sectionOpen;
  const projectGroups = projectId ? getProjectNavGroups(projectId, role) : [];

  function toggleSection(): void {
    if (isCollapsed) {
      setOpen(true);
      setProjectSectionOpen(true);
      return;
    }
    setProjectSectionOpen(!isOpen);
  }

  return (
    <MotionConfig reducedMotion="user">
      <SidebarGroup className="border-t border-border pt-3">
        <SidebarGroupLabel className="sr-only">Project</SidebarGroupLabel>
        <Button
          type="button"
          variant="ghost"
          aria-expanded={isOpen}
          aria-controls={isOpen ? `${layoutGroupId}-panel` : undefined}
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
        {!isCollapsed && (
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div
                id={`${layoutGroupId}-panel`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeInOut" }}
                className="ml-3 mt-1 overflow-hidden border-l border-border pl-3"
              >
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      nativeButton={false}
                      render={<Link href="/projects" prefetch={false} onClick={onNavigate} aria-current={isProjectList ? "page" : undefined} />}
                      isActive={isProjectList}
                      className={cn(largeTouchTarget && "min-h-12", isProjectList && "bg-primary-soft")}
                    >
                      <span className="truncate">Semua Project</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                <div className="mt-2 border-t border-border pt-2">
                  <ProjectSwitcher activeProject={activeProject} onNavigate={onNavigate} role={role} compact />
                  {projectId ? (
                    <div className="mt-2">
                      <ProjectNavList
                        groups={projectGroups}
                        onNavigate={onNavigate}
                        largeTouchTarget={largeTouchTarget}
                        layoutGroupId={`${layoutGroupId}-details`}
                        resetKey={projectId}
                      />
                    </div>
                  ) : (
                    <p className="px-3 py-2 text-xs text-text-muted">Pilih project untuk membuka menunya.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </SidebarGroup>
    </MotionConfig>
  );
}
