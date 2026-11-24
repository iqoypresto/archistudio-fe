import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarDays, ClipboardList, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SupervisorAreaTaskStatus } from "@/types/api/report-lock.types";

type TaskCardProps = {
  areas: SupervisorAreaTaskStatus[] | undefined;
  loading: boolean;
  failed: boolean;
  retry: () => void;
};

function TaskMessage(areas: SupervisorAreaTaskStatus[]) {
  const pendingCount = areas.reduce((count, area) => count + area.pendingDates.length, 0);
  const overdueCount = areas.reduce((count, area) => count + area.overdueDates.length, 0);

  if (areas.length === 0) {
    return {
      tone: "info",
      title: "Belum ada area aktif",
      description: "Area yang ditugaskan kepada Anda akan muncul di sini.",
    };
  }
  if (pendingCount > 0) {
    return {
      tone: "warning",
      title: "Ada laporan yang perlu diselesaikan",
      description: overdueCount > 0
        ? `${pendingCount} laporan menunggu, termasuk ${overdueCount} laporan tertunggak.`
        : `${pendingCount} laporan menunggu untuk dikirim.`,
    };
  }
  if (areas.every((area) => area.isTodayRestDay)) {
    return {
      tone: "info",
      title: "Hari ini jadwal istirahat",
      description: "Tidak ada laporan rutin yang perlu dikirim hari ini.",
    };
  }
  if (areas.every((area) => area.isTodaySubmitted || area.isTodayRestDay)) {
    return {
      tone: "success",
      title: "Tugas Anda hari ini sudah selesai.",
      description: "Terima kasih atas kerja keras dan dedikasi Anda hari ini.",
    };
  }
  return {
    tone: "info",
    title: "Belum ada laporan terbuka",
    description: "Kewajiban laporan berikutnya akan muncul di halaman Laporan.",
  };
}

function TaskCardContent({ areas }: { areas: SupervisorAreaTaskStatus[] | undefined }) {
  const message = TaskMessage(areas ?? []);
  const Icon = message.tone === "success"
    ? BadgeCheck
    : message.tone === "warning"
      ? Clock3
      : message.tone === "info"
        ? message.title.startsWith("Hari ini") ? CalendarDays : ClipboardList
        : ClipboardList;
  const iconToneClass = message.tone === "success"
    ? "bg-status-success-bg text-status-success-fg"
    : message.tone === "warning"
      ? "bg-status-warning-bg text-status-warning-fg"
      : "bg-primary-soft text-primary";

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-primary/25 bg-surface p-4">
      <span className={`flex size-14 shrink-0 items-center justify-center rounded-xl ${iconToneClass}`}>
        <Icon className="size-7" strokeWidth={2.5} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold leading-[1.25] text-text-primary">
          {message.title}
        </h2>
        <p className="mt-2 text-base leading-5 text-text-secondary">
          {message.description}
        </p>
        {message.tone === "warning" && (
          <Link href="/field/reports" className="mt-2 inline-flex min-h-12 items-center gap-1 font-semibold text-primary">
            Buka Laporan <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function SupervisorHomeTaskCard({ areas, loading, failed, retry }: TaskCardProps) {
  if (loading) return <Skeleton className="h-32 w-full rounded-2xl" aria-label="Memuat ringkasan tugas" />;
  if (failed) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="font-semibold text-text-primary">Ringkasan tugas belum dapat dimuat.</p>
        <Button type="button" variant="outline" onClick={retry} className="mt-2 min-h-12">Coba lagi</Button>
      </div>
    );
  }
  return <TaskCardContent areas={areas} />;
}
