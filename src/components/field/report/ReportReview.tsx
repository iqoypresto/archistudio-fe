import Image from "next/image";
import { FileText, Image as ImageIcon, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReportFormValues } from "@/lib/validation/report.validation";
import type { PhotoQueueItem } from "@/types/api/upload.types";

export function ReportReview({ values, photos, signerName, signerTitle, late, onEdit }: {
  values: ReportFormValues; photos: PhotoQueueItem[]; signerName: string; signerTitle: string; late: boolean;
  onEdit: (step: 1 | 2) => void;
}) {
  const work = values.reportType === "WORK";
  return <div className="space-y-3">
    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <FileText aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <h2 className="min-w-0 flex-1 text-sm font-bold text-text-primary">Keterangan</h2>
        <Button type="button" size="sm" variant="outline" onClick={() => onEdit(1)} className="h-7 min-h-7 min-w-14 rounded-md px-3 text-xs">Ubah</Button>
      </div>
      <div className="mt-3 border-t border-border" />
      <div className="mt-3">
        <p className="font-semibold text-text-primary">{work ? `Ada Pekerjaan · ${values.weather}` : "Tidak Ada Pekerjaan"}</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{work ? values.progressText : values.noWorkReason}</p>
        {work && <dl className="mt-2 space-y-1 text-sm text-text-secondary">
          <div><dt className="inline font-medium">Pekerja hadir: </dt><dd className="inline">{values.workerCount} orang</dd></div>
          <div><dt className="font-medium">Hambatan</dt><dd className="whitespace-pre-wrap">{values.obstaclesText}</dd></div>
          <div><dt className="font-medium">Rencana besok</dt><dd className="whitespace-pre-wrap">{values.tomorrowPlanText}</dd></div>
        </dl>}
      </div>
    </section>

    <section className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <ImageIcon aria-hidden="true" className="size-4 shrink-0 text-primary" />
        <h2 className="min-w-0 flex-1 text-sm font-bold text-text-primary">Foto</h2>
        <Button type="button" size="sm" variant="outline" onClick={() => onEdit(2)} className="h-7 min-h-7 min-w-14 rounded-md px-3 text-xs">Ubah</Button>
      </div>
      <div className="mt-3 border-t border-border" />
      <div className="mt-3 flex items-center gap-2 overflow-x-auto">
        {photos.slice(0, 4).map((photo, index) => photo.previewUrl
          ? <Image key={photo.id} src={photo.previewUrl} alt={`Foto laporan ${index + 1}`} width={84} height={84} unoptimized className="size-[5.25rem] shrink-0 rounded-xl object-cover" />
          : <div key={photo.id} className="grid size-[5.25rem] shrink-0 place-items-center rounded-xl bg-secondary"><ImageIcon aria-hidden="true" /></div>)}
        <span className="shrink-0 text-sm font-medium text-text-primary">{photos.length} foto</span>
      </div>
    </section>

    <section className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
      <UserRound aria-hidden="true" className="mt-1 size-5 shrink-0 text-primary" />
      <div><h2 className="text-base font-bold text-text-primary">Penanggung Jawab</h2><p className="mt-1 font-semibold text-text-primary">{signerName}</p><p className="text-sm text-text-secondary">{signerTitle}</p></div>
    </section>
    {late && <p role="note" className="rounded-xl border border-[#e4bd57] bg-[#fff2c6] p-3 text-sm text-[#583500]">Batas waktu pukul 17.00 sudah terlewati. Laporan ini akan dicatat terlambat.</p>}
  </div>;
}
