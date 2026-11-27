"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Download, Maximize, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { fileApi } from "@/lib/api/file.api";
import type { ProjectFilePreviewItem } from "@/types/project-file.types";
import { ImageDocumentCanvas } from "./ImageDocumentCanvas";
import { PdfDocumentCanvas } from "./PdfDocumentCanvas";

export function ProjectFilePreviewDialog({ file, onClose }: {
  file: ProjectFilePreviewItem | null;
  onClose: () => void;
}) {
  const [pageInfo, setPageInfo] = useState<{ fileId: string; page: number; count: number } | null>(null);
  const [zoomInfo, setZoomInfo] = useState<{ fileId: string; zoom: number } | null>(null);
  const [fitRevision, setFitRevision] = useState(0);
  const page = pageInfo && pageInfo.fileId === file?.id ? pageInfo.page : 1;
  const pages = pageInfo && pageInfo.fileId === file?.id ? pageInfo.count : 1;
  const zoom = zoomInfo && zoomInfo.fileId === file?.id ? zoomInfo.zoom : 1;
  const reportPage = useCallback((current: number, count: number) => {
    if (file) setPageInfo({ fileId: file.id, page: current, count });
  }, [file]);
  const setScale = (next: number) => file && setZoomInfo({ fileId: file.id, zoom: Math.min(4, Math.max(0.4, next)) });

  return (
    <Dialog open={Boolean(file)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} overlayClassName="bg-black/85 backdrop-blur-none"
        className="fixed inset-0 left-0 top-0 z-50 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-[#202124] p-0 text-white shadow-none ring-0 sm:max-w-none">
        {file && <>
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#1d1e20] px-4">
            <DialogTitle className="min-w-0 flex-1 truncate text-base font-semibold text-white">{file.fileName}</DialogTitle>
            <Button type="button" variant="ghost" size="icon-lg" onClick={onClose} aria-label="Tutup pratinjau"
              className="size-12 shrink-0 rounded-full text-white hover:bg-white/10 hover:text-white">
              <X className="size-7" />
            </Button>
          </header>
          <main className="min-h-0 flex-1 bg-[#292a2c]">
            {file.mimeType === "application/pdf"
              ? <PdfDocumentCanvas key={file.id} file={file} pageNumber={page} zoom={zoom}
                fitRevision={fitRevision} onPageInfo={reportPage} />
              : <ImageDocumentCanvas key={file.id} file={file} zoom={zoom} />}
          </main>
          <footer className="flex min-h-20 shrink-0 items-center justify-between gap-2 border-t border-white/10 bg-[#191a1c] px-3 py-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <ZoomButton label="Perkecil" onClick={() => setScale(zoom - 0.25)}><Minus /></ZoomButton>
              <ZoomButton label="Perbesar" onClick={() => setScale(zoom + 0.25)}><Plus /></ZoomButton>
              <span className="mx-1 h-9 w-px bg-white/20" />
              <Button type="button" onClick={() => { setScale(1); setFitRevision((value) => value + 1); }}
                className="min-h-12 gap-2 rounded-xl bg-white/10 px-3 text-sm text-white hover:bg-white/15">
                <Maximize className="size-5" /><span className="hidden min-[360px]:inline">Sesuaikan</span>
              </Button>
            </div>
            {file.mimeType === "application/pdf" && pages > 1 && (
              <label className="shrink-0 text-sm tabular-nums">
                <span className="sr-only">Pilih halaman PDF</span>
                <select value={page} aria-label="Pilih halaman PDF" onChange={(event) => setPageInfo({ fileId: file.id, page: Number(event.target.value), count: pages })}
                  className="h-11 w-[4.5rem] appearance-none rounded-lg bg-transparent px-2 text-center text-white outline-none focus-visible:ring-2 focus-visible:ring-white/70">
                  {Array.from({ length: pages }, (_, index) => <option key={index + 1} value={index + 1} className="bg-[#202124] text-white">{index + 1} / {pages}</option>)}
                </select>
              </label>
            )}
            <Button type="button" onClick={() => void fileApi.downloadContent(file.contentPath, file.fileName)}
              aria-label="Unduh file" className="min-h-12 shrink-0 gap-2 rounded-xl bg-white/10 px-3 text-sm text-white hover:bg-white/15 sm:px-4">
              <Download className="size-5" /><span className="hidden min-[360px]:inline">Unduh</span><span className="sr-only min-[360px]:hidden">Unduh</span>
            </Button>
          </footer>
        </>}
      </DialogContent>
    </Dialog>
  );
}

function ZoomButton({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return <Button type="button" variant="ghost" size="icon-lg" aria-label={label} onClick={onClick}
    className="size-12 rounded-xl bg-white/10 text-white hover:bg-white/15 hover:text-white">{children}</Button>;
}
