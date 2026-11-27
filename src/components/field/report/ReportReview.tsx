import Image from "next/image";
import { FileText, Image as ImageIcon, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { ReportFormValues } from "@/lib/validation/report.validation";
import type { PhotoQueueItem } from "@/types/api/upload.types";

const editButtonClass = "rounded-md px-3 text-sm";

const summaryEditButtonClass = "h-7 min-h-7 w-20 min-w-20 rounded-lg border-[#e8d9cf] bg-[#fffaf7] px-3 text-sm text-[#243247] hover:bg-[#f7eee8]";

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] gap-x-4 py-3.5 first:pt-4 last:pb-4">
      <dt className="text-base font-medium leading-6 text-[#6b605c]">{label}</dt>
      <dd className="min-w-0 break-words whitespace-pre-wrap text-lg font-semibold leading-7 text-[#1d1c1b]">
        {children}
      </dd>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-4 first:pt-4 last:pb-0">
      <dt className="text-base font-semibold leading-6 text-[#6b605c]">{label}</dt>
      <dd className="mt-1.5 min-w-0 break-words whitespace-pre-wrap text-lg leading-7 text-[#1d1c1b]">
        {children}
      </dd>
    </div>
  );
}

export function ReportReview({
  values,
  photos,
  signerName,
  signerTitle,
  late,
  onEdit,
}: {
  values: ReportFormValues;
  photos: PhotoQueueItem[];
  signerName: string;
  signerTitle: string;
  late: boolean;
  onEdit: (step: 1 | 2) => void;
}) {
  const work = values.reportType === "WORK";
  const weatherLabel = values.weather === "CERAH" ? "Cerah" : values.weather === "BERAWAN" ? "Berawan" : "Hujan";
  return (
    <div className="space-y-3">
      <section className="rounded-3xl border border-[#ead9cc] bg-[#fffdfb] p-5">
        <div className="flex items-center gap-3.5">
          <FileText aria-hidden="true" className="size-5 shrink-0 text-[#9c471d]" />
          <h2 className="min-w-0 flex-1 text-xl font-bold leading-7 text-[#1d1c1b]">Keterangan</h2>
          <Button type="button" size="xs" variant="outline" onClick={() => onEdit(1)} className={summaryEditButtonClass}>
            Ubah
          </Button>
        </div>
        <dl className="mt-4 divide-y divide-[#ead9cc] border-y border-[#ead9cc]">
          <SummaryRow label="Jenis laporan">{work ? "Ada Pekerjaan" : "Tidak Ada Pekerjaan"}</SummaryRow>
          {work && <>
            <SummaryRow label="Cuaca">{weatherLabel}</SummaryRow>
            <SummaryRow label="Pekerja hadir">{values.workerCount} orang</SummaryRow>
          </>}
        </dl>
        <dl className="divide-y divide-[#ead9cc]">
          {work ? (
            <>
              <DetailRow label="Pekerjaan hari ini">{values.progressText}</DetailRow>
              <DetailRow label="Hambatan">{values.obstaclesText}</DetailRow>
              <DetailRow label="Rencana besok">{values.tomorrowPlanText}</DetailRow>
            </>
          ) : (
            <DetailRow label="Keterangan alasan">{values.noWorkReason}</DetailRow>
          )}
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          <ImageIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <h2 className="min-w-0 flex-1 text-sm font-bold text-text-primary">Foto</h2>
          <Button type="button" size="sm" variant="outline" onClick={() => onEdit(2)} className={editButtonClass}>
            Ubah
          </Button>
        </div>
        <div className="mt-3 border-t border-border" />
        <div className="mt-3 flex items-center gap-2 overflow-x-auto">
          {photos.slice(0, 4).map((photo, index) =>
            photo.previewUrl ? (
              <Image
                key={photo.id}
                src={photo.previewUrl}
                alt={`Foto laporan ${index + 1}`}
                width={84}
                height={84}
                unoptimized
                className="size-[5.25rem] shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div key={photo.id} className="grid size-[5.25rem] shrink-0 place-items-center rounded-xl bg-secondary">
                <ImageIcon aria-hidden="true" />
              </div>
            ),
          )}
          <span className="shrink-0 text-sm font-medium text-text-primary">{photos.length} foto</span>
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
        <UserRound aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
        <div>
          <h2 className="text-base font-bold text-text-primary">Penanggung Jawab</h2>
          <p className="mt-1 font-semibold text-text-primary">{signerName}</p>
          <p className="text-sm text-text-secondary">{signerTitle}</p>
        </div>
      </section>
      {late && (
        <p role="note" className="rounded-xl border border-[#e4bd57] bg-[#fff2c6] p-3 text-sm text-[#583500]">
          Batas waktu pukul 17.00 sudah terlewati. Laporan ini akan dicatat terlambat.
        </p>
      )}
    </div>
  );
}
