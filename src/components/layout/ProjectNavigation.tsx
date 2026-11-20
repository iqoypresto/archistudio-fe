"use client";

import { useId, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, FolderKanban } from "lucide-react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/api/auth.types";
import type { ProjectOption } from "@/types/api/project.types";
import { ProjectNavList } from "./ProjectNavList";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { getProjectNavGroups } from "./workspace-nav.config";

export function ProjectNavigation({
  projectId,
  activeProject,
  role,
  onNavigate,
  layoutGroupId,
  largeTouchTarget = false,
}: {
  projectId?: string;
  activeProject?: ProjectOption | null;
  role: UserRole;
  onNavigate?: () => void;
  layoutGroupId: string;
  largeTouchTarget?: boolean;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const drawerId = useId();
  const isProjectActive = Boolean(projectId && pathname.startsWith(`/projects/${projectId}`));
  const [drawerState, setDrawerState] = useState<{ projectId?: string; open: boolean }>({
    projectId,
    open: isProjectActive,
  });
  const isOpen = drawerState.projectId === projectId ? drawerState.open : isProjectActive;
  const groups = projectId ? getProjectNavGroups(projectId, role) : [];

  function toggleDrawer(): void {
    setDrawerState({ projectId, open: !isOpen });
  }

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label="Navigasi project">
        <motion.div className={cn("group/project-row relative flex items-center rounded-lg transition-colors hover:bg-surface-active", isProjectActive && "bg-primary-soft")}>
          <Button
            type="button"
            variant="ghost"
            aria-expanded={isOpen}
            aria-controls={drawerId}
            onClick={toggleDrawer}
            className={cn(
              "relative z-10 h-auto w-full justify-start gap-3 rounded-lg bg-transparent px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-transparent group-hover/project-row:text-text-primary",
              largeTouchTarget ? "min-h-12" : "min-h-11",
              isProjectActive && "font-semibold text-text-primary",
            )}
          >
            <FolderKanban className="size-5 shrink-0" />
            <span className="flex-1 text-left">Project</span>
            <ChevronDown className={cn("size-4 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} aria-hidden="true" />
          </Button>
        </motion.div>
        <motion.div
          id={drawerId}
          aria-hidden={!isOpen}
          inert={!isOpen}
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={{ open: { height: "auto", opacity: 1 }, closed: { height: 0, opacity: 0 } }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeInOut" }}
          className="ml-5 mt-1 space-y-2 overflow-hidden border-l border-border pl-3"
        >
          <ProjectSwitcher activeProject={activeProject} onNavigate={onNavigate} />
          {projectId ? (
            <ProjectNavList
              groups={groups}
              onNavigate={onNavigate}
              largeTouchTarget={largeTouchTarget}
              layoutGroupId={layoutGroupId}
              resetKey={projectId}
              animateOnMount
            />
          ) : (
            <p className="px-2 py-1 text-xs text-text-muted">Pilih project untuk membuka menunya.</p>
          )}
        </motion.div>
      </section>
    </MotionConfig>
  );
}
