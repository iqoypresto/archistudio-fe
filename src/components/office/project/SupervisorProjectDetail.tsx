import Link from "next/link";
import { ArrowLeft, ArrowRight, FileImage, MapPin } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import type { ProjectAreaSummary, ProjectDetail } from "@/types/api/project.types";

export function SupervisorProjectDetail({ project, areas, isLoading, isError, error, onRetry }: {
  project?: ProjectDetail;
  areas?: ProjectAreaSummary[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  return <div className="space-y-5">
    <Link href="/projects" className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-primary">
      <ArrowLeft className="size-5" /> Project Saya
    </Link>
    <AsyncStateView isLoading={isLoading} isError={isError} error={error} data={project}
      onRetry={onRetry} emptyTitle="Project tidak ditemukan">
      {(item) => <>
        <header className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-wide text-primary">{item.code} · {item.status}</p>
          <h1 className="text-2xl font-bold text-text-primary">{item.name}</h1>
          <p className="flex items-center gap-2 text-sm text-text-secondary"><MapPin className="size-4" />{item.location}</p>
        </header>
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">Area Saya</h2>
          {areas?.length ? areas.map((area) => <div key={area.id}
            className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold text-primary">{area.code}</p>
            <p className="font-bold text-text-primary">{area.name}</p>
            <Link href="/field/tasks" className="mt-2 inline-flex min-h-12 items-center gap-2 font-semibold text-primary">
              Lihat Tugas Lapor <ArrowRight className="size-4" />
            </Link>
          </div>) : <p className="rounded-2xl bg-surface p-4 text-text-secondary">Belum ada area aktif yang tersedia.</p>}
        </section>
        <Link href={`/projects/${item.id}/drawings`}
          className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-surface p-4 font-semibold text-text-primary">
          <FileImage className="size-5 text-primary" /> Drawing In / Out <ArrowRight className="ml-auto size-5 text-primary" />
        </Link>
      </>}
    </AsyncStateView>
  </div>;
}
