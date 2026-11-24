import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReportFormValues } from "@/lib/validation/report.validation";
import type { PhotoQueueItem } from "@/types/api/upload.types";

export function ReportReview({
  values, areaName, projectName, reportDate, photos, onEdit,
}: {
  values: ReportFormValues;
  areaName: string;
  projectName: string;
  reportDate: string;
  photos: PhotoQueueItem[];
  onEdit: (step: 1 | 2) => void;
}) {
  return <div className="space-y-4">
    <section className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm text-text-secondary">{projectName}</p>
      <h2 className="text-lg font-bold text-text-primary">{areaName}</h2>
      <p className="mt-1 text-sm tabular-nums text-text-secondary">Tanggal Lapor: {reportDate}</p>
    </section>
    <section className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-text-primary">Kondisi lapangan</h2>
        <Button type="button" variant="outline" className="min-h-12" onClick={() => onEdit(1)}>Ubah</Button>
      </div>
      <p className="text-sm font-semibold text-primary">{values.reportType === "WORK" ? "Ada Pekerjaan" : "Hari Tanpa Pekerjaan"}</p>
      {values.reportType === "WORK" ? <dl className="space-y-3 text-sm">
        <div><dt className="text-text-secondary">Cuaca · Pekerja hadir</dt><dd className="text-text-primary">{values.weather} · {values.workerCount} orang</dd></div>
        <div><dt className="text-text-secondary">Progres</dt><dd className="whitespace-pre-wrap text-text-primary">{values.progressText}</dd></div>
        <div><dt className="text-text-secondary">Hambatan</dt><dd className="whitespace-pre-wrap text-text-primary">{values.obstaclesText}</dd></div>
        <div><dt className="text-text-secondary">Rencana besok</dt><dd className="whitespace-pre-wrap text-text-primary">{values.tomorrowPlanText}</dd></div>
      </dl> : <p className="whitespace-pre-wrap text-sm text-text-primary">{values.noWorkReason}</p>}
      {values.locationText && <p className="text-sm text-text-secondary">Lokasi: {values.locationText}</p>}
    </section>
    <section className="space-y-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="font-semibold text-text-primary">Foto laporan ({photos.length})</span>
        <Button type="button" variant="outline" className="min-h-12" onClick={() => onEdit(2)}>Ubah</Button>
      </div>
      <div className="space-y-2">
        {photos.map((photo, index) => <div key={photo.id} className="flex items-center gap-3 rounded-xl bg-secondary/70 p-2.5">
          {photo.previewUrl ? (
            <Image src={photo.previewUrl} alt={`Foto laporan ${index + 1}`} width={56} height={56} unoptimized className="size-14 shrink-0 rounded-lg object-cover" />
          ) : (
            <div role="img" aria-label={`Pratinjau foto ${index + 1} tidak tersedia; nama file ${photo.fileName}`} className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-surface text-text-secondary">
              <ImageIcon aria-hidden="true" className="size-5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary">Foto {index + 1}</p>
            <p className="truncate text-xs text-text-secondary">{photo.fileName}</p>
            <p className="truncate text-sm text-text-secondary">{photo.caption.trim() || "Tanpa keterangan"}</p>
          </div>
        </div>)}
      </div>
    </section>
    <p className="rounded-xl bg-primary-soft p-4 text-sm text-text-primary">Setelah dikirim, laporan terkunci dan paraf nama serta waktu kirim dibubuhkan otomatis.</p>
  </div>;
}
