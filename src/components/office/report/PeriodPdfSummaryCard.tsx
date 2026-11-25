import { formatShortTimezone } from "@/lib/utils/office-format";
import type { ProjectDetail } from "@/types/api/project.types";

interface PeriodPdfSummaryCardProps {
  project?: ProjectDetail;
  isMonthly: boolean;
}

export function PeriodPdfSummaryCard({ project, isMonthly }: PeriodPdfSummaryCardProps) {
  return (
    <aside className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
        Ringkasan Isi Dokumen PDF
      </h2>
      <dl className="mt-3.5 divide-y divide-border/70 text-xs">
        <div className="flex justify-between gap-2 py-2.5">
          <dt className="text-text-muted">Proyek</dt>
          <dd className="text-right font-medium text-text-primary">
            {project ? `${project.code} · ${project.name}` : "-"}
          </dd>
        </div>
        <div className="flex justify-between gap-2 py-2.5">
          <dt className="text-text-muted">Zona Waktu</dt>
          <dd className="font-medium text-text-primary">
            {formatShortTimezone(project?.timezone)}
          </dd>
        </div>
        <div className="space-y-1.5 py-2.5">
          <dt className="text-text-muted">Konten Tercetak</dt>
          <dd className="leading-relaxed text-text-secondary">
            {isMonthly
              ? "Ringkasan hari wajib lapor, tepat waktu, terlambat, dan belum lapor untuk setiap area pada bulan terpilih."
              : "Laporan harian lengkap per area beserta dokumentasi foto 2 kolom dan paraf pengirim."}
          </dd>
        </div>
        <div className="space-y-1.5 pt-2.5">
          <dt className="text-text-muted">Tanggal Tanpa Laporan</dt>
          <dd className="leading-relaxed text-text-secondary">
            {isMonthly
              ? "Hari libur rutin proyek tidak dihitung sebagai hari wajib lapor."
              : "Area tanpa laporan pada hari kerja akan ditandai “Belum lapor” secara otomatis di PDF."}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
