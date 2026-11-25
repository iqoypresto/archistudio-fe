"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3 } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button, buttonVariants } from "@/components/ui/button";
import { useReportDetailQuery } from "@/hooks/report.hooks";
import { cn } from "@/lib/utils";
import { canOwnerReviseReport } from "@/lib/validation/report-revision.validation";
import { useAuthStore } from "@/stores/auth.store";
import { OwnerReviseReportModal } from "./OwnerReviseReportModal";
import { ReportDetailView } from "./ReportDetailView";

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
  const report = detailQuery.data;
  const canRevise = Boolean(report && canOwnerReviseReport(userRole, report.status));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-9 gap-1.5 border-border bg-surface px-3 text-xs text-text-secondary hover:bg-surface-active hover:text-text-primary",
          )}
        >
          <ArrowLeft className="size-3.5" />
          Kembali ke Daftar
        </Link>

        {canRevise && (
          <Button
            type="button"
            size="sm"
            onClick={() => setReviseOpen(true)}
            className="h-9 gap-1.5 px-3 text-xs"
          >
            <Edit3 className="size-3.5" />
            Revisi Laporan
          </Button>
        )}
      </div>

      <AsyncStateView
        isLoading={detailQuery.isLoading}
        isError={detailQuery.isError}
        error={detailQuery.error}
        data={detailQuery.data}
        onRetry={() => detailQuery.refetch()}
        emptyTitle="Laporan tidak ditemukan"
      >
        {(loadedReport) => (
          <>
            <ReportDetailView report={loadedReport} />
            {userRole === "OWNER" && loadedReport.status === "SUBMITTED" && (
              <OwnerReviseReportModal
                key={`${loadedReport.id}:${loadedReport.revisionNo}`}
                report={loadedReport}
                open={reviseOpen}
                onOpenChange={setReviseOpen}
              />
            )}
          </>
        )}
      </AsyncStateView>
    </div>
  );
}
