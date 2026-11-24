import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ServerPagination } from "@/components/ui/ServerPagination";
import type { PaginationMeta } from "@/types/api";
import type { ProjectListItem } from "@/types/api/project.types";
import { projectStatusLabel } from "@/lib/utils/project-status";

export function SupervisorProjectList({ projects, meta, search, onSearch, onPageChange }: {
  projects: ProjectListItem[];
  meta: PaginationMeta;
  search: string;
  onSearch: (value: string) => void;
  onPageChange: (page: number) => void;
}) {
  return <div className="space-y-4">
    <div><h1 className="text-2xl font-bold text-text-primary">Project Saya</h1>
      <p className="text-sm text-text-secondary">Project dengan penugasan aktif Anda.</p></div>
    <Input aria-label="Cari project" placeholder="Cari nama atau kode project" value={search}
      onChange={(event) => onSearch(event.target.value)} className="min-h-12 bg-surface text-base" />
    {projects.length === 0 ? <p className="rounded-2xl bg-surface p-5 text-text-secondary">Tidak ada project yang sesuai.</p>
      : projects.map((project) => <Link key={project.id} href={`/projects/${project.id}`}
        className="flex min-h-32 items-center gap-3 rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <span className="min-w-0 flex-1 space-y-1">
          <span className="block text-xs font-bold normal-case tracking-wide text-primary">{project.code} · {projectStatusLabel(project.status)}</span>
          <span className="block text-lg font-bold text-text-primary">{project.name}</span>
          <span className="flex items-center gap-1 text-sm text-text-secondary"><MapPin className="size-4 shrink-0" />{project.location}</span>
        </span><ArrowRight className="size-5 shrink-0 text-primary" />
      </Link>)}
    <ServerPagination meta={meta} onPageChange={onPageChange} />
  </div>;
}
