import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalNoteBox } from "@/components/ui/ModalContextStrip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExportDailyReportPdfMutation } from "@/hooks/dashboard.hooks";
import { useProjectsQuery } from "@/hooks/project.hooks";
import { ApiError } from "@/lib/api/api-error";
import { PdfExportReadinessPanel } from "./PdfExportReadinessPanel";

interface PdfExportDialogProps {
  isOpen: boolean;
  defaultProjectId?: string;
  defaultDate?: string;
  onClose: () => void;
}

export function PdfExportDialog({
  isOpen,
  defaultProjectId = "",
  defaultDate = "",
  onClose,
}: PdfExportDialogProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId);
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const { data: projectsRes } = useProjectsQuery({ page: 1, pageSize: 100 });
  const exportMutation = useExportDailyReportPdfMutation();
  const projects = projectsRes?.data ?? [];
  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedProjectLabel = selectedProject
    ? `${selectedProject.code} · ${selectedProject.name}`
    : undefined;
  const missingAreas =
    exportMutation.error instanceof ApiError
      ? exportMutation.error.fields?.filter((field) => field.field === "missingAreas") ?? []
      : [];
  const exportErrorMessage =
    exportMutation.error instanceof Error
      ? exportMutation.error.message
      : "Gagal membuat PDF laporan.";

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedDate) return;
    exportMutation.mutate(
      {
        projectId: selectedProjectId,
        date: selectedDate,
        projectCode: selectedProject?.code,
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleDownload} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Export PDF Laporan Harian</DialogTitle>
            <DialogDescription className="text-xs">
              Unduh rekap laporan harian satu proyek beserta foto 2 kolom dan paraf pengirim.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="pdfProjectId" className="text-xs font-medium">
                Proyek
              </Label>
              <Select
                value={selectedProjectId}
                onValueChange={(val: string | null) => setSelectedProjectId(val ?? "")}
              >
                <SelectTrigger id="pdfProjectId" className="h-9 text-xs">
                  <SelectValue placeholder="Pilih proyek">{selectedProjectLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code} · {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pdfDate" className="text-xs font-medium">
                Tanggal Laporan
              </Label>
              <Input
                id="pdfDate"
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-9 text-xs tabular-nums"
              />
            </div>
          </div>

          <PdfExportReadinessPanel projectId={selectedProjectId} date={selectedDate} />

          {exportMutation.isError && (
            <ModalNoteBox tone="danger">
              <p className="font-medium">{exportErrorMessage}</p>
              {missingAreas.length > 0 && (
                <ul className="mt-1.5 list-inside list-disc space-y-0.5">
                  {missingAreas.map((area, index) => (
                    <li key={`${area.message}-${index}`}>{area.message}</li>
                  ))}
                </ul>
              )}
            </ModalNoteBox>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9">
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={exportMutation.isPending || !selectedProjectId || !selectedDate}
              className="h-9 gap-1.5"
            >
              <FileDown className="size-3.5" />
              {exportMutation.isPending ? "Memproses PDF..." : "Unduh PDF"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
