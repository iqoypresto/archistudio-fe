import { useState } from "react";
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
  ModalContextStrip,
  ModalMetricStrip,
  ModalNoteBox,
} from "@/components/ui/ModalContextStrip";
import { Textarea } from "@/components/ui/textarea";
import { useUnlockAreaMutation } from "@/hooks/dashboard.hooks";
import { formatIdDate } from "@/lib/utils/office-format";
import type { DashboardAreaStatusItem } from "@/types/api/dashboard.types";

interface AreaUnlockModalProps {
  isOpen: boolean;
  area: DashboardAreaStatusItem | null;
  onClose: () => void;
}

export function AreaUnlockModal({ isOpen, area, onClose }: AreaUnlockModalProps) {
  const [dateSelection, setDateSelection] = useState<{ areaId: string; value: string } | null>(null);
  const [reason, setReason] = useState("");
  const unlockMutation = useUnlockAreaMutation();

  if (!area) return null;
  const initialUnlockDate = area.oldestOverdueDate ?? "";
  const selectedUnlockDate =
    dateSelection?.areaId === area.areaId ? dateSelection.value : initialUnlockDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnlockDate) return;
    unlockMutation.mutate(
      {
        areaId: area.areaId,
        payload: {
          unlockedThroughDate: selectedUnlockDate,
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        },
      },
      {
        onSuccess: () => {
          setReason("");
          setDateSelection(null);
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Buka Kunci Manual Laporan Area</DialogTitle>
            <DialogDescription className="text-xs">
              Area ini terkunci otomatis karena melewati batas tunggakan 3 hari kerja.
            </DialogDescription>
          </DialogHeader>

          <ModalContextStrip
            kicker={`${area.projectCode} · ${area.projectName}`}
            title={`${area.areaCode} · ${area.areaName}`}
            meta={area.supervisor ? `Supervisor: ${area.supervisor.name}` : "Belum ada supervisor aktif"}
          />

          <ModalMetricStrip
            items={[
              {
                label: "Total Tunggakan",
                value: `${area.overdueBusinessDaysCount} hari kerja`,
                accent: "danger",
              },
              {
                label: "Tunggakan Tertua",
                value: formatIdDate(area.oldestOverdueDate),
              },
            ]}
          />

          <div className="space-y-1.5">
            <Label htmlFor="unlockedThroughDate" className="text-xs font-medium">
              Buka Kunci Hingga Tanggal
            </Label>
            <Input
              id="unlockedThroughDate"
              type="date"
              required
              value={selectedUnlockDate}
              onChange={(e) => setDateSelection({ areaId: area.areaId, value: e.target.value })}
              className="h-9 text-xs tabular-nums"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="reason" className="text-xs font-medium">
                Catatan Audit / Alasan
              </Label>
              <span className="text-[11px] text-text-muted">Opsional</span>
            </div>
            <Textarea
              id="reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Kendala cuaca ekstrem atau gangguan jaringan di lokasi proyek..."
              className="min-h-20 w-full rounded-lg border-border bg-surface-input p-2.5 text-xs"
            />
          </div>

          <ModalNoteBox>
            Supervisor tetap diwajibkan mengirim laporan secara berurutan mulai dari tanggal
            tunggakan tertua terlebih dahulu.
          </ModalNoteBox>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9">
              Batal
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              disabled={unlockMutation.isPending || !selectedUnlockDate}
              className="h-9"
            >
              {unlockMutation.isPending ? "Membuka..." : "Buka Kunci Area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
