import Link from "next/link";
import { ArrowRight, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatIdDate } from "@/lib/utils/office-format";
import type { ArchivedProjectItem } from "@/types/api/project.types";

interface ArchiveYearTableProps {
  year: number;
  projects: ArchivedProjectItem[];
  isOwner: boolean;
  onRestore: (project: ArchivedProjectItem) => void;
}

export function ArchiveYearTable({ year, projects, isOwner, onRestore }: ArchiveYearTableProps) {
  return (
    <div>
      <div className="flex items-center justify-between bg-canvas/50 px-4 py-2.5 sm:px-5">
        <h2 className="flex items-center gap-2 text-xs font-semibold text-text-primary">
          <Folder className="size-3.5 text-text-muted" />
          Folder Tahun {year}
        </h2>
        <span className="text-xs text-text-muted">{projects.length} proyek</span>
      </div>

      <Table>
        <TableHeader className="bg-surface-input/40">
          <TableRow className="border-border/70 hover:bg-transparent">
            <TableHead className="h-9 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Proyek &amp; Klien
            </TableHead>
            <TableHead className="h-9 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Jenis Arsip
            </TableHead>
            <TableHead className="h-9 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Tanggal Tindakan
            </TableHead>
            <TableHead className="h-9 px-4 text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Akses
            </TableHead>
            <TableHead className="h-9 px-4 text-right text-[11px] font-medium tracking-wider text-text-muted uppercase">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="border-border/60 hover:bg-surface-input/40">
              <TableCell className="px-4 py-3">
                <p className="text-[13px] font-medium text-text-primary">
                  <span className="text-text-muted">{project.code}</span> {project.name}
                </p>
                <p className="mt-0.5 text-xs text-text-secondary">
                  {project.clientName} · {project.location}
                </p>
              </TableCell>
              <TableCell className="px-4 py-3">
                <StatusIndicator tone={project.archiveType === "COMPLETED" ? "success" : "warning"}>
                  {project.archiveType === "COMPLETED" ? "Selesai" : "Arsip Manual"}
                </StatusIndicator>
              </TableCell>
              <TableCell className="px-4 py-3">
                <p className="text-[13px] text-text-primary">{formatIdDate(project.archivedActionAt)}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {project.archiveType === "COMPLETED" ? "Diselesaikan" : "Diarsipkan manual"}
                </p>
              </TableCell>
              <TableCell className="px-4 py-3 text-xs text-text-muted">Baca saja</TableCell>
              <TableCell className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {isOwner && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary"
                      onClick={() => onRestore(project)}
                    >
                      Pulihkan
                    </Button>
                  )}
                  <Link
                    href={`/office/projects/${project.id}`}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-surface-input px-2.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary"
                  >
                    Detail
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
