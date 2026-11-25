"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, FileImage, MapPin, User } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { isCommsAllowedRole } from "@/lib/utils/role";
import { projectStatusLabel } from "@/lib/utils/project-status";
import { useAuthStore } from "@/stores/auth.store";
import type { ProjectAreaSummary, ProjectDetail } from "@/types/api/project.types";

export function SupervisorProjectDetail({ project, areas, isLoading, isError, error, onRetry }: {
  project?: ProjectDetail;
  areas?: ProjectAreaSummary[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry: () => void;
}) {
  const role = useAuthStore((state) => state.user?.role);
  const canAccessComms = isCommsAllowedRole(role);
  const isSiteManager = role === "SITE_MANAGER";

  return <div className="space-y-5">
    <Link href="/projects" className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-primary">
      <ArrowLeft className="size-5" /> Project Saya
    </Link>
    <AsyncStateView isLoading={isLoading} isError={isError} error={error} data={project}
      onRetry={onRetry} emptyTitle="Project tidak ditemukan">
      {(item) => <>
        <header className="space-y-2">
          <p className="text-sm font-bold normal-case tracking-wide text-primary">{item.code} · {projectStatusLabel(item.status)}</p>
          <h1 className="text-2xl font-bold text-text-primary">{item.name}</h1>
          <p className="flex items-center gap-2 text-sm text-text-secondary"><MapPin className="size-4" />{item.location}</p>
          {item.siteManager && (
            <p className="flex items-center gap-2 text-sm text-text-secondary">
              <User className="size-4" /> Site Manager: {item.siteManager.name}
            </p>
          )}
        </header>
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-text-primary">{isSiteManager ? "Daftar Area Project" : "Area Saya"}</h2>
          {areas?.length ? areas.map((area) => <div key={area.id}
            className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold text-primary">{area.code}</p>
            <p className="font-bold text-text-primary">{area.name}</p>
            <Link href="/field/reports" className="mt-2 inline-flex min-h-12 items-center gap-2 font-semibold text-primary">
              Lihat Tugas Lapor <ArrowRight className="size-4" />
            </Link>
          </div>) : <p className="rounded-2xl bg-surface p-4 text-text-secondary">Belum ada area aktif yang tersedia.</p>}
        </section>
        <section className="space-y-2.5" aria-label="Dokumen dan Komunikasi Project">
          <Link href={`/projects/${item.id}/drawings`}
            className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-surface p-4 font-semibold text-text-primary">
            <FileImage className="size-5 text-primary" /> Drawing <ArrowRight className="ml-auto size-5 text-primary" />
          </Link>
          {canAccessComms && (
            <>
              <Link href={`/projects/${item.id}/comms/in`}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-surface p-4 font-semibold text-text-primary">
                <ArrowDownLeft className="size-5 text-primary" /> Comms In <ArrowRight className="ml-auto size-5 text-primary" />
              </Link>
              <Link href={`/projects/${item.id}/comms/out`}
                className="flex min-h-16 items-center gap-3 rounded-2xl border border-border bg-surface p-4 font-semibold text-text-primary">
                <ArrowUpRight className="size-5 text-primary" /> Comms Out <ArrowRight className="ml-auto size-5 text-primary" />
              </Link>
            </>
          )}
        </section>
      </>}
    </AsyncStateView>
  </div>;
}
