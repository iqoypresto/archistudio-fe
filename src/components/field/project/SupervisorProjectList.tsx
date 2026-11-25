import Link from "next/link";
import { Building2, CircleCheck, CirclePlay, ClipboardList, MapPin, type LucideIcon } from "lucide-react";
import { ServerPagination } from "@/components/ui/ServerPagination";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaginationMeta } from "@/types/api";
import type { ProjectListItem, ProjectStatus } from "@/types/api/project.types";
import { projectStatusLabel } from "@/lib/utils/project-status";
import { SupervisorProjectEmptyIllustration } from "./SupervisorProjectEmptyIllustration";

type StatusStyle = {
  icon: LucideIcon;
  className: string;
};

function getStatusStyle(status: ProjectStatus): StatusStyle {
  if (status === "PERSIAPAN") {
    return {
      icon: ClipboardList,
      className: "bg-[var(--project-status-preparation-bg)] text-[var(--project-status-preparation-fg)]",
    };
  }
  if (status === "BERJALAN") {
    return {
      icon: CirclePlay,
      className: "bg-[var(--project-status-running-bg)] text-[var(--project-status-running-fg)]",
    };
  }
  return {
    icon: CircleCheck,
    className: "bg-[var(--project-status-complete-bg)] text-[var(--project-status-complete-fg)]",
  };
}

function ProjectStatusPill({ status }: { status: ProjectStatus }) {
  const style = getStatusStyle(status);
  const Icon = style.icon;
  return (
    <span className={`inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 text-center text-xs font-semibold leading-none ${style.className}`}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="whitespace-nowrap">{projectStatusLabel(status)}</span>
    </span>
  );
}

function ProjectDetails({ project }: { project: ProjectListItem }) {
  return (
    <>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <h2 className="min-w-0 flex-1 break-words text-xl font-bold leading-[1.3] text-[var(--project-text-heading)]">{project.name}</h2>
        <ProjectStatusPill status={project.status} />
      </div>
      <div className="mt-3 space-y-1.5 text-base leading-6 text-[var(--project-text-body)]">
        <p className="flex min-w-0 items-start gap-2">
          <MapPin className="mt-1 size-5 shrink-0 text-[var(--project-accent)]" aria-hidden="true" />
          <span className="min-w-0 break-words">{project.location}</span>
        </p>
        <p className="flex min-w-0 items-start gap-2">
          <Building2 className="mt-1 size-5 shrink-0 text-[var(--project-accent)]" aria-hidden="true" />
          <span className="min-w-0 break-words">{project.clientName}</span>
        </p>
      </div>
    </>
  );
}

function ProjectCardFooter({ project }: { project: ProjectListItem }) {
  return (
    <Link href={`/field/projects/${project.id}`} className="inline-flex min-h-12 w-full min-w-0 items-center justify-center rounded-xl bg-[var(--project-action)] px-3 text-center text-base font-semibold text-white transition-colors hover:bg-[var(--project-action-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--project-action-hover)]">
      Masuk ke Project
    </Link>
  );
}

function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <article className="rounded-[1.125rem] border border-[var(--project-border)] bg-[var(--project-surface)] p-4 shadow-[var(--project-card-shadow)]">
      <ProjectDetails project={project} />
      <div className="my-3 border-t border-[var(--project-border)]" />
      <ProjectCardFooter project={project} />
    </article>
  );
}

function ProjectEmptyState() {
  return (
    <div className="flex min-h-[calc(100svh-19rem)] flex-col items-center justify-center px-4 pb-16 pt-4 text-center">
      <SupervisorProjectEmptyIllustration />
      <h2 className="mt-2 max-w-[19rem] break-words text-[1.375rem] font-bold leading-[1.35] text-[var(--project-text-empty)]">
        Belum ada project yang ditugaskan kepadamu.
      </h2>
    </div>
  );
}

export function SupervisorProjectList({ projects, meta, onPageChange, isPageChanging = false }: {
  projects: ProjectListItem[];
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  isPageChanging?: boolean;
}) {
  if (projects.length === 0) return <ProjectEmptyState />;

  return (
    <div className="space-y-4 px-4 pb-8 pt-8" aria-busy={isPageChanging || undefined}>
      {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
      {meta.totalPages > 1 && <ServerPagination meta={meta} onPageChange={onPageChange} isUpdating={isPageChanging} />}
    </div>
  );
}

export function SupervisorProjectListSkeleton() {
  return (
    <div className="project-list-skeleton space-y-4 px-4 pb-8 pt-8" aria-busy="true" aria-label="Memuat project">
      <Skeleton className="min-h-[13.8125rem] w-full rounded-[1.125rem] bg-[var(--project-skeleton)]" />
      <Skeleton className="min-h-[13.8125rem] w-full rounded-[1.125rem] bg-[var(--project-skeleton)]" />
      <Skeleton className="min-h-[13.8125rem] w-full rounded-[1.125rem] bg-[var(--project-skeleton)]" />
    </div>
  );
}
