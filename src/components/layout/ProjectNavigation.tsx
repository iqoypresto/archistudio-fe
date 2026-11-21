"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FolderKanban } from "lucide-react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
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
  const isCurrentProject = Boolean(projectId && pathname.startsWith(`/projects/${projectId}`));
  const isProjectList = pathname === "/projects";
  const isProjectSectionActive = isCurrentProject || isProjectList;
  const sectionKey = projectId ?? (isProjectList ? "project-list" : "global");
  const [sectionState, setSectionState] = useState({ key: sectionKey, open: isProjectSectionActive });
  const isOpen = sectionState.key === sectionKey ? sectionState.open : isProjectSectionActive;
  const panelId = `${layoutGroupId}-panel`;
  const projectGroups = projectId ? getProjectNavGroups(projectId, role) : [];

  function toggleSection(): void {
    setSectionState({ key: sectionKey, open: !isOpen });
  }

  return (
    <MotionConfig reducedMotion="user">
      <section className="border-t border-border pt-4" aria-label="Navigasi project">
        <Button
          type="button"
          variant="ghost"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={toggleSection}
          className={cn(
            "h-auto w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-text-primary hover:bg-surface-active",
            largeTouchTarget ? "min-h-12" : "min-h-11",
            isProjectSectionActive && "bg-primary-soft",
          )}
        >
          <FolderKanban className="size-5 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-left">Project</span>
          <ChevronDown className={cn("size-4 transition-transform motion-reduce:transition-none", isOpen && "rotate-180")} aria-hidden="true" />
        </Button>
        <motion.div
          id={panelId}
          aria-hidden={!isOpen}
          inert={!isOpen}
          initial={false}
          animate={isOpen ? "open" : "closed"}
          variants={{ open: { height: "auto", opacity: 1 }, closed: { height: 0, opacity: 0 } }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeInOut" }}
          className="ml-3 mt-2 space-y-3 overflow-hidden border-l border-border pl-3"
        >
          <ProjectSwitcher activeProject={activeProject} onNavigate={onNavigate} />
          <Link
            href="/projects"
            onClick={onNavigate}
            aria-current={isProjectList ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors motion-reduce:transition-none",
              isProjectList ? "bg-primary-soft text-text-primary" : "text-text-secondary hover:bg-surface-active hover:text-text-primary",
            )}
          >
            Semua Project
          </Link>
          {projectId ? (
            <ProjectNavList
              groups={projectGroups}
              onNavigate={onNavigate}
              largeTouchTarget={largeTouchTarget}
              layoutGroupId={`${layoutGroupId}-details`}
              resetKey={projectId}
            />
          ) : (
            <p className="px-3 py-1 text-xs text-text-muted">Pilih project untuk membuka menunya.</p>
          )}
        </motion.div>
      </section>
    </MotionConfig>
  );
}
