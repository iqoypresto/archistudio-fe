"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Edit3, Info } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button, buttonVariants } from "@/components/ui/button";
import { useReportDetailQuery } from "@/hooks/report.hooks";
import { ApiError } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";
import { canOwnerReviseReport } from "@/lib/validation/report-revision.validation";
import { useAuthStore } from "@/stores/auth.store";
import { OwnerReviseReportModal } from "./OwnerReviseReportModal";
import { FieldReportDetailView } from "./FieldReportDetailView";
import { ReportDetailSkeleton } from "./ReportDetailSkeleton";
import { ReportDetailView } from "./ReportDetailView";
import type { ApiSurface } from "@/lib/api/api-surface";

export function ReportDetailContent({
  reportId,
  backHref,
  surface = "office",
}: {
  reportId: string;
  backHref: string;
  surface?: ApiSurface;
}) {
  const [reviseOpen, setReviseOpen] = useState(false);
  const userRole = useAuthStore((state) => state.user?.role);
  const detailQuery = useReportDetailQuery(reportId, surface);
  const report = detailQuery.data;
  const isProjectArchived = Boolean(
    report && (report.project.status === "SELESAI" || Boolean(report.project.archivedAt)),
  );
  const canRevise = Boolean(
    surface === "office" && report && canOwnerReviseReport(userRole, report.status, report.project),
  );
  const isNotFound = detailQuery.error instanceof ApiError
    && (detailQuery.error.statusCode === 404 || detailQuery.error.code === "RESOURCE_NOT_FOUND");

  return (
    <div className={cn("min-w-0", surface !== "field" && "space-y-5")}>
      {surface !== "field" && (
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-10 gap-1.5 border-border bg-surface px-3 text-xs text-text-secondary hover:bg-surface-active hover:text-text-primary sm:h-9",
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
              className="h-10 gap-1.5 px-3 text-xs sm:h-9"
            >
              <Edit3 className="size-3.5" />
              Revisi Laporan
            </Button>
          )}
        </div>
      )}

      {userRole === "OWNER" && isProjectArchived && surface === "office" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-xs text-text-secondary">
          <Info className="mt-0.5 size-4 shrink-0 text-text-muted" />
          <span>
            Proyek ini berada di Archive sehingga laporan bersifat baca saja. Pulihkan proyek terlebih dahulu bila perlu melakukan revisi.
          </span>
        </div>
      )}

      <AsyncStateView
        isLoading={detailQuery.isLoading}
        isError={surface === "field" ? detailQuery.isError && !isNotFound : detailQuery.isError}
        error={detailQuery.error}
        data={detailQuery.data}
        onRetry={() => detailQuery.refetch()}
        emptyTitle={surface === "field" ? "Laporan tidak ditemukan" : undefined}
        emptyDescription={surface === "field" ? "Data laporan ini tidak tersedia atau sudah tidak dapat diakses." : undefined}
        loadingFallback={surface === "field" ? <ReportDetailSkeleton /> : undefined}
      >
        {(loadedReport) => (
          <>
            {surface === "field" ? (
              <FieldReportDetailView report={loadedReport} />
            ) : (
              <ReportDetailView report={loadedReport} surface={surface} />
            )}
            {canRevise && (
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
