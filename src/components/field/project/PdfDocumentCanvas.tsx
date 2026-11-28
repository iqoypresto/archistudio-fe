"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { fileApi } from "@/lib/api/file.api";
import type { ProjectFilePreviewItem } from "@/types/project-file.types";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask } from "pdfjs-dist";

export function PdfDocumentCanvas({ file, pageNumber, zoom, fitRevision, onPageInfo }: {
  file: ProjectFilePreviewItem;
  pageNumber: number;
  zoom: number;
  fitRevision: number;
  onPageInfo: (page: number, count: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sizeVersion, setSizeVersion] = useState(0);

  useEffect(() => loadPdf(file.contentPath, file.blob, onPageInfo, setDocument, setError, setIsLoading), [file.contentPath, file.blob, onPageInfo]);
  useEffect(() => observeSize(containerRef.current, () => setSizeVersion((value) => value + 1)), []);
  useEffect(() => renderPdfPage(document, pageNumber, zoom, containerRef.current, canvasRef.current, setError),
    [document, pageNumber, zoom, fitRevision, sizeVersion]);

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-auto p-4" aria-busy={isLoading}>
      {isLoading && <div className="flex items-center gap-2 text-sm text-white/75"><LoaderCircle className="size-5 animate-spin" /> Memuat dokumen…</div>}
      {error && <p role="alert" className="max-w-sm text-center text-sm text-white">{error}</p>}
      <canvas ref={canvasRef} aria-label={`${file.fileName}, halaman ${pageNumber}`} className={isLoading || error ? "hidden" : "block max-w-none bg-white shadow-xl"} />
    </div>
  );
}

function observeSize(element: HTMLDivElement | null, update: () => void): () => void {
  if (!element || typeof ResizeObserver === "undefined") return () => undefined;
  const observer = new ResizeObserver(update);
  observer.observe(element);
  return () => observer.disconnect();
}

function loadPdf(path: string, preloadedBlob: Blob | undefined, onPageInfo: (page: number, count: number) => void,
  setDocument: (value: PDFDocumentProxy | null) => void, setError: (value: string | null) => void,
  setLoading: (value: boolean) => void): () => void {
  let active = true;
  let task: PDFDocumentLoadingTask | undefined;
  void (async () => {
    try {
      const pdfjs = await import("pdfjs-dist");
      const workerUrl = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      pdfjs.GlobalWorkerOptions.workerSrc ||= workerUrl;
      pdfjs.GlobalWorkerOptions.rendererSrc ||= workerUrl;
      const blob = preloadedBlob ?? await fileApi.getContent(path);
      task = pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) });
      const loaded = await task.promise;
      if (!active) return;
      setDocument(loaded);
      onPageInfo(1, loaded.numPages);
    } catch {
      if (active) setError("Pratinjau PDF tidak dapat dimuat. Anda dapat mengunduh file untuk membukanya.");
    } finally {
      if (active) setLoading(false);
    }
  })();
  return () => { active = false; void task?.destroy(); };
}

function renderPdfPage(document: PDFDocumentProxy | null, pageNumber: number, zoom: number,
  container: HTMLDivElement | null, canvas: HTMLCanvasElement | null,
  setError: (value: string | null) => void): () => void {
  if (!document || !container || !canvas) return () => undefined;
  let renderTask: RenderTask | undefined;
  let cancelled = false;
  void document.getPage(pageNumber).then((page) => {
    if (cancelled) return;
    const base = page.getViewport({ scale: 1 });
    const fitScale = Math.min((container.clientWidth - 32) / base.width, (container.clientHeight - 32) / base.height);
    const viewport = page.getViewport({ scale: Math.max(0.1, fitScale) * zoom });
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * ratio);
    canvas.height = Math.floor(viewport.height * ratio);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    renderTask = page.render({ canvas, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] });
    return renderTask.promise;
  }).catch(() => {
    if (!cancelled) setError("Halaman PDF ini tidak dapat dirender.");
  });
  return () => { cancelled = true; renderTask?.cancel(); };
}
