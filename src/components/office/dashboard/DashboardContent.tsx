"use client";

import { useMemo, useState } from "react";
import { FileDown } from "lucide-react";
import { AreaUnlockModal } from "@/components/office/dashboard/AreaUnlockModal";
import { DashboardAreaTable } from "@/components/office/dashboard/DashboardAreaTable";
import { DashboardFilterBar } from "@/components/office/dashboard/DashboardFilterBar";
import { DashboardKpiCards } from "@/components/office/dashboard/DashboardKpiCards";
import { PdfExportDialog } from "@/components/office/dashboard/PdfExportDialog";
import { SupervisorLatenessTable } from "@/components/office/dashboard/SupervisorLatenessTable";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardSummary, useSupervisorLateness } from "@/hooks/dashboard.hooks";
import type { DashboardAreaStatusItem, DashboardStatusFilter } from "@/types/api/dashboard.types";

function getInitialTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function DashboardContent() {
  const [projectId, setProjectId] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>(getInitialTodayDate);
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>("ALL");
  const [selectedUnlockArea, setSelectedUnlockArea] = useState<DashboardAreaStatusItem | null>(null);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);

  const summaryQuery = useDashboardSummary({
    projectId: projectId || undefined,
    date: targetDate,
    statusFilter,
  });

  const latenessQuery = useSupervisorLateness({
    projectId: projectId || undefined,
  });

  const defaultMetrics = useMemo(
    () => ({
      totalProjects: 0,
      activeAreas: 0,
      reportsSubmittedToday: 0,
      areasOverdueMoreThan3Days: 0,
    }),
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard Monitoring"
        description="Pantau disiplin pelaporan harian per area, keterlambatan supervisor, dan export PDF."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPdfExportOpen(true)}
            className="h-9 gap-1.5 border-border bg-surface px-3 text-xs text-text-primary hover:bg-surface-active"
          >
            <FileDown className="size-3.5" />
            Export PDF Opsi A
          </Button>
        }
      />

      <AsyncStateView
        data={summaryQuery.data}
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
        error={summaryQuery.error as Error | null}
        onRetry={() => summaryQuery.refetch()}
      >
        {(summary) => (
          <div className="space-y-5">
            <DashboardKpiCards metrics={summary.metrics ?? defaultMetrics} />

            <section className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
              <DashboardFilterBar
                projectId={projectId}
                onProjectChange={setProjectId}
                targetDate={targetDate}
                onDateChange={setTargetDate}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onOpenExportDialog={() => setIsPdfExportOpen(true)}
              />

              <Tabs defaultValue="areas" className="w-full">
                <TabsList className="mb-3 bg-surface-input">
                  <TabsTrigger value="areas" className="text-xs">
                    Status Area &amp; Pelaporan
                  </TabsTrigger>
                  <TabsTrigger value="supervisors" className="text-xs">
                    Kedisiplinan Supervisor
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="areas" className="space-y-4">
                  <DashboardAreaTable
                    areas={summary.areas}
                    onOpenUnlockModal={(area) => setSelectedUnlockArea(area)}
                  />
                </TabsContent>

                <TabsContent value="supervisors" className="space-y-4">
                  <AsyncStateView
                    data={latenessQuery.data}
                    isLoading={latenessQuery.isLoading}
                    isError={latenessQuery.isError}
                    error={latenessQuery.error as Error | null}
                    onRetry={() => latenessQuery.refetch()}
                  >
                    {(latenessItems) => <SupervisorLatenessTable items={latenessItems} />}
                  </AsyncStateView>
                </TabsContent>
              </Tabs>
            </section>
          </div>
        )}
      </AsyncStateView>

      <AreaUnlockModal
        isOpen={Boolean(selectedUnlockArea)}
        area={selectedUnlockArea}
        onClose={() => setSelectedUnlockArea(null)}
      />

      <PdfExportDialog
        key={`${projectId}:${targetDate}:${isPdfExportOpen}`}
        isOpen={isPdfExportOpen}
        defaultProjectId={projectId}
        defaultDate={targetDate}
        onClose={() => setIsPdfExportOpen(false)}
      />
    </div>
  );
}
