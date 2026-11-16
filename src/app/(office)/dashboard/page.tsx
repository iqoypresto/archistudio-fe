"use client";

import { useMemo, useState } from "react";
import { AreaUnlockModal } from "@/components/office/dashboard/AreaUnlockModal";
import { DashboardAreaTable } from "@/components/office/dashboard/DashboardAreaTable";
import { DashboardFilterBar } from "@/components/office/dashboard/DashboardFilterBar";
import { DashboardKpiCards } from "@/components/office/dashboard/DashboardKpiCards";
import { PdfExportDialog } from "@/components/office/dashboard/PdfExportDialog";
import { SupervisorLatenessTable } from "@/components/office/dashboard/SupervisorLatenessTable";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboardSummary, useSupervisorLateness } from "@/hooks/dashboard.hooks";
import type { DashboardAreaStatusItem, DashboardStatusFilter } from "@/types/api/dashboard.types";

function getInitialTodayDate(): string {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export default function DashboardPage() {
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

  const handleOpenUnlock = (area: DashboardAreaStatusItem) => {
    setSelectedUnlockArea(area);
  };

  const handleCloseUnlock = () => {
    setSelectedUnlockArea(null);
  };

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
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Monitoring"
        description="Pantau disiplin pelaporan harian per area, keterlambatan supervisor, dan export PDF."
      />

      <AsyncStateView
        data={summaryQuery.data}
        isLoading={summaryQuery.isLoading}
        isError={summaryQuery.isError}
        error={summaryQuery.error as Error | null}
        onRetry={() => summaryQuery.refetch()}
      >
        {(summary) => (
          <div className="space-y-6">
            <DashboardKpiCards metrics={summary.metrics ?? defaultMetrics} />

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
              <TabsList className="mb-4">
                <TabsTrigger value="areas">Status Area &amp; Pelaporan</TabsTrigger>
                <TabsTrigger value="supervisors">Kedisiplinan Supervisor</TabsTrigger>
              </TabsList>

              <TabsContent value="areas" className="space-y-4">
                <DashboardAreaTable
                  areas={summary.areas}
                  onOpenUnlockModal={handleOpenUnlock}
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
          </div>
        )}
      </AsyncStateView>

      <AreaUnlockModal
        isOpen={Boolean(selectedUnlockArea)}
        area={selectedUnlockArea}
        onClose={handleCloseUnlock}
      />

      <PdfExportDialog
        isOpen={isPdfExportOpen}
        defaultProjectId={projectId}
        defaultDate={targetDate}
        onClose={() => setIsPdfExportOpen(false)}
      />
    </div>
  );
}
