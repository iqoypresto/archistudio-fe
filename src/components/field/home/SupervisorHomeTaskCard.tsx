"use client";

import Link from "next/link";
import { ArrowRight, CircleAlert, ThumbsUp } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
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
  const shouldReduceMotion = useReducedMotion();
  const StatusIcon = hasOpenTasks ? CircleAlert : ThumbsUp;
  return (
    <Card className="gap-0 overflow-hidden rounded-[1.125rem] border border-[var(--project-border)] bg-[var(--project-surface)] py-0 shadow-[var(--project-card-shadow)]">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start gap-3">
          <motion.span
            aria-hidden="true"
            initial={false}
            animate={hasOpenTasks && !shouldReduceMotion ? { opacity: [1, 0.55, 1] } : { opacity: 1 }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: hasOpenTasks && !shouldReduceMotion ? Infinity : 0, repeatDelay: 1.4 }}
            className="mt-0.5 flex size-12 shrink-0 items-center justify-center rounded-full bg-[#fff1db] text-[#a75024]"
          >
            <StatusIcon className="size-6" strokeWidth={2} />
          </motion.span>
          <div className="min-w-0 space-y-1.5 pt-0.5">
            <CardTitle className="text-lg font-bold leading-[1.3] text-[var(--project-text-heading)]">{message.title}</CardTitle>
            <CardDescription className="text-base leading-6 text-[var(--project-text-body)]">{message.description}</CardDescription>
          </div>
        </div>
        {hasOpenTasks && (
          <Link href="/field/reports" className={cn(buttonVariants(), "min-h-12 w-full gap-2 rounded-xl bg-[var(--project-action)] px-4 text-base font-semibold text-white hover:bg-[var(--project-action-hover)]")}>
            Isi Laporan Sekarang <ArrowRight className="size-5" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export function SupervisorHomeTaskCard({ areas, loading, failed, retry }: TaskCardProps) {
  if (loading) return <Skeleton className="h-56 w-full rounded-[1.125rem] bg-[var(--project-skeleton)]" aria-label="Memuat status laporan" />;
  if (failed) {
    return (
      <Card className="gap-0 rounded-[1.125rem] border border-[var(--project-border)] bg-[var(--project-surface)] py-0 shadow-[var(--project-card-shadow)]">
        <CardContent className="space-y-4 p-6 text-center">
          <p className="font-semibold text-[var(--project-text-heading)]">Ringkasan tugas belum dapat dimuat.</p>
          <Button type="button" onClick={retry} className="min-h-12 w-full bg-[var(--project-action)] text-white hover:bg-[var(--project-action-hover)]">Coba lagi</Button>
        </CardContent>
      </Card>
    );
  }
  return <TaskCardContent areas={areas} />;
}
