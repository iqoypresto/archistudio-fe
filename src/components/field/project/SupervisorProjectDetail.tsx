"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, FileImage, MapPin, MessageCircle, Users, UserRound } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { projectStatusLabel } from "@/lib/utils/project-status";
import { formatIdDate } from "@/lib/utils/office-format";
import type { ProjectAreaSummary, ProjectDetail } from "@/types/api/project.types";

interface Props {
  project?: ProjectDetail;
  areas?: ProjectAreaSummary[];
  drawingCount: number | null;
  commsCount: number | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
  canAccessComms: boolean;
  isSiteManager: boolean;
}

export function SupervisorProjectDetail(props: Props) {
  const { project, areas, drawingCount, commsCount, isLoading, isError, error, onRetry } = props;

  return (
    <div className="space-y-5 text-[var(--project-text-heading)]">
      <AsyncStateView isLoading={isLoading} isError={isError} error={error} data={project}
        onRetry={onRetry} emptyTitle="Project tidak ditemukan">
        {(item) => (
          <div className="space-y-5">
            <ProjectIdentity project={item} />
            <ProjectInformation project={item} />
            <ProjectDestinations projectId={item.id} drawingCount={drawingCount}
              commsCount={commsCount} canAccessComms={props.canAccessComms} />
            <AssignedAreas areas={areas} title={props.isSiteManager ? "Daftar Area Project" : "Area Tugas Saya"} />
          </div>
        )}
      </AsyncStateView>
    </div>
  );
}

function ProjectIdentity({ project }: { project: ProjectDetail }) {
  const statusTone = project.status === "BERJALAN"
    ? "bg-[#e4efdd] text-[#356b3b]"
    : project.status === "SELESAI"
      ? "bg-[#e3e9f2] text-[#355a7b]"
      : "bg-[#e9e8ea] text-[#4d4a50]";

  return (
    <header className="space-y-2 px-1 pt-3">
      <h1 className="break-words text-[1.8rem] font-bold leading-tight tracking-tight sm:text-3xl">
        {project.name}
      </h1>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-lg font-medium text-[var(--project-text-secondary)]">{project.code}</span>
        <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${statusTone}`}>
          {projectStatusLabel(project.status)}
        </span>
      </div>
    </header>
  );
}

function ProjectInformation({ project }: { project: ProjectDetail }) {
  const period = [project.startDate && formatIdDate(project.startDate), project.endDate && formatIdDate(project.endDate)]
    .filter(Boolean).join(" – ");
  const rows = [
    { icon: MapPin, label: "Lokasi", value: project.location },
    { icon: Users, label: "Klien", value: project.clientName },
    { icon: CalendarDays, label: "Periode", value: period },
    ...(project.siteManager ? [{ icon: UserRound, label: "Site Manager", value: project.siteManager.name }] : []),
  ].filter((row) => row.value);

  return (
    <section aria-label="Informasi project" className="rounded-[1.125rem] border border-[var(--project-border)] bg-white px-4 py-2 shadow-[var(--project-card-shadow)]">
      {rows.map(({ icon: Icon, label, value }, index) => (
        <div key={label} className={`grid grid-cols-[2.75rem_5.25rem_minmax(0,1fr)] items-start gap-2 py-3 ${index > 0 ? "border-t border-[var(--project-border)]" : ""}`}>
          <Icon className="mt-0.5 size-6 text-[var(--project-action)]" aria-hidden="true" />
          <span className="text-base text-[var(--project-text-secondary)]">{label}</span>
          <span className="min-w-0 break-words text-base font-bold leading-snug text-[var(--project-text-heading)]">{value}</span>
        </div>
      ))}
    </section>
  );
}

function ProjectDestinations({ projectId, drawingCount, commsCount, canAccessComms }: {
  projectId: string; drawingCount: number | null; commsCount: number | null; canAccessComms: boolean;
}) {
  return (
    <section aria-label="Dokumen project" className="grid grid-cols-2 gap-2.5">
      <DestinationCard href={`/field/projects/${projectId}/drawings`} icon={FileImage} title="Gambar" count={drawingCount} />
      {canAccessComms && <DestinationCard href={`/field/projects/${projectId}/comms`} icon={MessageCircle} title="Comms" count={commsCount} />}
    </section>
  );
}

function DestinationCard({ href, icon: Icon, title, count }: {
  href: string; icon: typeof FileImage; title: string; count: number | null;
}) {
  return (
    <Link href={href} className="flex min-h-24 min-w-0 items-center gap-2 rounded-[1.125rem] border border-[var(--project-border)] bg-white p-3 shadow-[var(--project-card-shadow)] transition-colors hover:bg-[#fffaf7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--project-action)]">
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff3ec] text-[var(--project-action)]"><Icon className="size-6" /></span>
      <span className="min-w-0 flex-1">
        <span className="block break-words text-base font-bold leading-tight">{title}</span>
        <span className="mt-1 block text-sm text-[var(--project-text-secondary)]">{count === null ? "— file" : `${count} file`}</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-[var(--project-action)]" aria-hidden="true" />
    </Link>
  );
}

function AssignedAreas({ areas, title }: { areas?: ProjectAreaSummary[]; title: string }) {
  return (
    <section className="rounded-[1.125rem] border border-[var(--project-border)] bg-white p-4 shadow-[var(--project-card-shadow)]" aria-label={title}>
      <h2 className="mb-3 flex items-center gap-3 text-xl font-bold">
        <span aria-hidden="true" className="h-6 w-1.5 rounded-full bg-[var(--project-action)]" />{title}
      </h2>
      {areas?.length ? (
        <div className="divide-y divide-[var(--project-border)]">
          {areas.map((area) => (
            <Link key={area.id} href="/field/reports" className="flex min-h-14 items-center justify-between gap-3 py-3 text-base font-semibold hover:text-[var(--project-action)] focus-visible:outline-2 focus-visible:outline-[var(--project-action)]">
              <span className="min-w-0 break-words">{area.name}</span>
              <ArrowRight className="size-4 shrink-0 text-[var(--project-action)]" aria-hidden="true" />
            </Link>
          ))}
        </div>
      ) : <p className="py-3 text-base text-[var(--project-text-secondary)]">Belum ada area aktif yang tersedia.</p>}
    </section>
  );
}
