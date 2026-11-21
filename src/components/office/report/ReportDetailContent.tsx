"use client";

import { useState } from "react";
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
