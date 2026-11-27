import { FileImage, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIdDate } from "@/lib/utils/office-format";
import type { ProjectFilePreviewItem } from "@/types/project-file.types";

export function ProjectFileCard({ file, onOpen }: {
  file: ProjectFilePreviewItem;
  onOpen: (file: ProjectFilePreviewItem) => void;
}) {
  const extension = getFileExtension(file.fileName, file.mimeType);
  const FileIcon = file.mimeType.startsWith("image/") ? FileImage : FileText;

  return (
    <article className="flex min-w-0 items-center gap-3 rounded-[1.125rem] border border-[var(--project-border)] bg-white p-3 shadow-[var(--project-card-shadow)] sm:p-4">
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#fff3ec] text-[var(--project-action)]" aria-hidden="true">
        <span className="flex flex-col items-center">
          <FileIcon className="size-7" strokeWidth={1.8} />
          <span className="text-[9px] font-bold leading-none">{extension}</span>
        </span>
      </span>
      <div className="min-w-0 flex-1 py-1">
        <h2 className="break-words text-base font-bold leading-tight text-[var(--project-text-heading)] [overflow-wrap:anywhere]">{file.fileName}</h2>
        <p className="mt-1 break-words text-sm leading-snug text-[var(--project-text-secondary)]">
          {formatFileSize(file.sizeBytes)} <span aria-hidden="true">·</span> {formatIdDate(file.uploadedAt)}
        </p>
        {file.secondaryLabel && <p className="mt-1 break-words text-xs text-[var(--project-text-secondary)]">{file.secondaryLabel}</p>}
      </div>
      <Button type="button" onClick={() => onOpen(file)} className="min-h-12 shrink-0 rounded-xl bg-[var(--project-action)] px-3 text-sm font-semibold text-white hover:bg-[var(--project-action-hover)] focus-visible:ring-[var(--project-action)] sm:px-4">
        Buka
      </Button>
    </article>
  );
}

function getFileExtension(fileName: string, mimeType: string): string {
  const match = fileName.match(/\.([^.]+)$/);
  if (match?.[1]) return match[1].slice(0, 5).toUpperCase();
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) return "IMG";
  return "FILE";
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const megabytes = bytes / (1024 * 1024);
  if (megabytes >= 1) return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(megabytes)} MB`;
  const kilobytes = Math.max(1, Math.round(bytes / 1024));
  return `${new Intl.NumberFormat("id-ID").format(kilobytes)} KB`;
}
