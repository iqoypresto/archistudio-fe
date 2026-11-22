"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { buttonVariants } from "@/components/ui/button";
import { useReportDetailQuery } from "@/hooks/report.hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { OwnerReviseReportModal } from "./OwnerReviseReportModal";
import { ReportDetailView } from "./ReportDetailView";
import { RevisionHistoryTimeline } from "./RevisionHistoryTimeline";

export function ReportDetailContent({
  reportId,
  backHref,
}: {
  reportId: string;
  backHref: string;
}) {
  const [reviseOpen, setReviseOpen] = useState(false);
  const userRole = useAuthStore((state) => state.user?.role);
  const detailQuery = useReportDetailQuery(reportId);
  const submitted = useSearchParams().get("submitted") === "1";

  return (
    <div className="space-y-4">
      <div>
        <Link
          href={backHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 gap-1.5 border-border bg-surface px-3 text-xs text-text-secondary hover:bg-surface-active hover:text-text-primary"
          )}
        >
          <ArrowLeft className="size-3.5" />
          Kembali ke Daftar
        </Link>
      </div>

      <AsyncStateView
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        error={detailQuery.error}
        data={detailQuery.data}
        onRetry={() => detailQuery.refetch()}
        emptyTitle="Laporan tidak ditemukan"
      >
        {(report) => (
          <div className="space-y-5">
            {submitted && userRole === "SUPERVISOR" && report.status === "SUBMITTED" && (
              <div role="status" className="rounded-2xl border border-status-success-fg/30 bg-status-success-bg p-5">
                <p className="text-lg font-bold text-status-success-fg">Laporan berhasil dikirim</p>
                <p className="mt-1 text-sm text-text-primary">{report.area.name} · {report.reportDate}</p>
                <p className="mt-1 text-sm text-text-secondary">Paraf: {report.signedByName} · {report.signedByTitle}</p>
                {report.submittedAt && <p className="text-sm text-text-secondary">Dikirim: {new Intl.DateTimeFormat("id-ID", {
                  timeZone: report.project.timezone, dateStyle: "medium", timeStyle: "short",
                }).format(new Date(report.submittedAt))}</p>}
                <Link href="/field/tasks" className="mt-3 inline-flex min-h-12 items-center font-semibold text-primary">Lanjut tugas berikutnya</Link>
              </div>
            )}
            <ReportDetailView
              report={report}
              userRole={userRole}
              onOpenReviseModal={() => setReviseOpen(true)}
            />
            <RevisionHistoryTimeline
              revisions={report.revisions}
              timeZone={report.project.timezone}
            />
            {userRole === "OWNER" && report.status === "SUBMITTED" && (
              <OwnerReviseReportModal
                key={`${report.id}:${report.revisionNo}`}
                report={report}
                open={reviseOpen}
                onOpenChange={setReviseOpen}
              />
            )}
          </div>
        )}
      </AsyncStateView>
    </div>
  );
}
