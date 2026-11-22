"use client";
import Link from "next/link";
import { Check, ClipboardList, FileText } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { useReportDetailQuery } from "@/hooks/report.hooks";
import { useAuthStore } from "@/stores/auth.store";

export function ReportSuccessContent({ reportId }: { reportId: string }) {
  const query = useReportDetailQuery(reportId);
  const userId = useAuthStore((state) => state.user?.id);
  return <AsyncStateView isLoading={query.isLoading} isError={query.isError}
    error={query.error} data={query.data} onRetry={() => query.refetch()}
    emptyTitle="Laporan tidak ditemukan">
    {(report) => report.status === "SUBMITTED" && report.supervisor.id === userId
      ? <div className="flex min-h-[70dvh] flex-col justify-center gap-6">
      <div className="space-y-4 text-center" role="status">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-status-success-bg text-status-success-fg motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-300">
          <Check className="size-10" strokeWidth={3} />
        </div>
        <div><h1 className="text-2xl font-bold text-text-primary">Laporan berhasil dikirim</h1>
          <p className="mt-2 text-sm text-text-secondary">Laporan dan foto sudah tersimpan. Paraf otomatis telah tercatat.</p></div>
      </div>
      <section className="space-y-3 rounded-2xl border border-border bg-surface p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">{report.reportNumber}</p>
        <h2 className="text-lg font-bold text-text-primary">{report.area.name}</h2>
        <p className="text-sm text-text-secondary">{report.project.name} · {report.reportDate}</p>
        <div className="border-t border-border pt-3 text-sm text-text-secondary">
          <p>{report.isLate ? "Diunggah terlambat" : "Tepat Waktu"}</p>
          {report.submittedAt && <p>Dikirim {new Intl.DateTimeFormat("id-ID", {
            timeZone: report.project.timezone, dateStyle: "medium", timeStyle: "short",
          }).format(new Date(report.submittedAt))}</p>}
          <p>Paraf: {report.signedByName} · {report.signedByTitle}</p>
        </div>
      </section>
      <div className="space-y-3">
        <Link href="/field/tasks" className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground">
          <ClipboardList className="size-5" /> Kembali ke Tugas Lapor
        </Link>
        <Link href={`/field/reports/${report.id}`} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface font-semibold text-text-primary">
          <FileText className="size-5" /> Lihat Laporan
        </Link>
      </div>
    </div> : <div className="space-y-4 rounded-2xl bg-surface p-5">
      <h1 className="text-lg font-bold">Laporan belum terkirim</h1>
      <Link href="/field/tasks" className="inline-flex min-h-12 items-center text-primary">Kembali ke Tugas Lapor</Link>
    </div>}
  </AsyncStateView>;
}
