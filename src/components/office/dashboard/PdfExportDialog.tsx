import { useState } from "react";
import { FileDown, FileText } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExportDailyReportPdfMutation } from "@/hooks/dashboard.hooks";
import { useProjectsQuery } from "@/hooks/project.hooks";

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

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedDate) return;
    const project = projects.find((p) => p.id === selectedProjectId);
    exportMutation.mutate(
      {
        projectId: selectedProjectId,
        date: selectedDate,
        projectCode: project?.code,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleDownload} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-brand-primary">
              <FileDown className="h-5 w-5" />
              Export PDF Laporan Harian (Opsi A)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Mengekspor laporan harian per project untuk satu tanggal tertentu (US-15, BR-29).
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900">
            <div className="flex items-center gap-2 font-semibold text-blue-800">
              <FileText className="h-4 w-4" />
              <span>Standar Format Opsi A (Klasik):</span>
            </div>
            <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-[11px] text-blue-700">
              <li>Kepala laporan berwarna biru klasik dengan logo &amp; identitas proyek.</li>
              <li>Dokumentasi foto lapangan terpasang 2 kolom per baris beserta keterangan.</li>
              <li>Membubuhkan paraf otomatis supervisor tanpa kolom &quot;Diketahui&quot; (BR-27).</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfProjectId" className="text-xs font-semibold">
              Pilih Proyek
            </Label>
            <Select
              value={selectedProjectId}
              onValueChange={(val: string | null) => setSelectedProjectId(val ?? "")}
            >
              <SelectTrigger id="pdfProjectId" className="h-9">
                <SelectValue placeholder="Pilih salah satu proyek" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfDate" className="text-xs font-semibold">
              Tanggal Laporan (YYYY-MM-DD)
            </Label>
            <Input
              id="pdfDate"
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={exportMutation.isPending || !selectedProjectId || !selectedDate}
              className="gap-1.5 bg-brand-primary text-white hover:bg-brand-primary/90"
            >
              <FileDown className="h-4 w-4" />
              {exportMutation.isPending ? "Memproses PDF..." : "Unduh PDF Laporan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
