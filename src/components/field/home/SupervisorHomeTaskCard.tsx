import Link from "next/link";
import { ArrowRight, CircleAlert, ThumbsUp } from "lucide-react";
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
  if (areas.length === 0) {
    return {
      title: "Belum ada project aktif",
      description: "Project dengan area tugas aktif akan muncul di sini.",
    };
  }
  if (areas.some((area) => area.pendingDates.length > 0)) {
    return {
      title: "Ada laporan yang perlu diisi",
      description: "Silakan isi laporan untuk project yang sedang Anda tangani.",
    };
  }
  if (areas.every((area) => area.isTodayRestDay)) {
    return {
      title: "Tidak ada laporan yang perlu diisi",
      description: "Terima kasih. Hari ini jadwal istirahat rutin.",
    };
  }
  if (areas.every((area) => area.isTodaySubmitted || area.isTodayRestDay)) {
    return {
      title: "Tidak ada laporan lagi yang perlu diisi",
      description: "Terima kasih, laporan hari ini sudah lengkap. Semoga pekerjaan Anda selalu lancar.",
    };
  }
  return {
    title: "Tidak ada laporan lagi yang perlu diisi",
    description: "Terima kasih, saat ini tidak ada laporan yang menunggu.",
  };
}

function TaskCardContent({ areas }: { areas: SupervisorAreaTaskStatus[] | undefined }) {
  const message = TaskMessage(areas ?? []);
  const hasOpenTasks = (areas ?? []).some((area) => area.pendingDates.length > 0);
  const StatusIcon = hasOpenTasks ? CircleAlert : ThumbsUp;
  const statusIconClass = hasOpenTasks
    ? "bg-[#f8eee3] text-[#9a4e16]"
    : "bg-[#eaf2e7] text-[#54764a]";
  return (
    <div className="overflow-hidden rounded-3xl border border-[#eadfd7] bg-white px-5 pb-5 pt-6 shadow-[0_8px_24px_rgba(66,45,32,0.08)]">
      <div>
        <h2 className="text-[1.4rem] font-bold leading-tight text-[#24211f]">{message.title}</h2>
        <p className="mt-2 text-base leading-6 text-[#5d5854]">{message.description}</p>
      </div>
      <div className={`mx-auto my-6 flex size-24 items-center justify-center rounded-full ${statusIconClass}`} aria-hidden="true">
        <StatusIcon className="size-12" strokeWidth={1.8} />
      </div>
      {hasOpenTasks && (
        <Link href="/field/reports" className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#694632] px-4 font-semibold text-white transition-colors hover:bg-[#513726] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#694632]">
          Isi Laporan Sekarang <ArrowRight className="size-5" />
        </Link>
      )}
    </div>
  );
}

export function SupervisorHomeTaskCard({ areas, loading, failed, retry }: TaskCardProps) {
  if (loading) return <Skeleton className="h-[26rem] w-full rounded-3xl" aria-label="Memuat status laporan" />;
  if (failed) {
    return (
      <div className="rounded-3xl border border-[#eadfd7] bg-white p-5 shadow-[0_8px_24px_rgba(66,45,32,0.08)]">
        <p className="font-semibold text-text-primary">Ringkasan tugas belum dapat dimuat.</p>
        <Button type="button" onClick={retry} className="mt-4 min-h-12 w-full bg-[#694632] text-white hover:bg-[#513726]">Coba lagi</Button>
      </div>
    );
  }
  return <TaskCardContent areas={areas} />;
}
