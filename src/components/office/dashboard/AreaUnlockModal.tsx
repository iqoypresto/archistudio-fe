import { useState } from "react";
import { AlertTriangle, KeyRound } from "lucide-react";
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
import { useUnlockAreaMutation } from "@/hooks/dashboard.hooks";
import type { DashboardAreaStatusItem } from "@/types/api/dashboard.types";

interface AreaUnlockModalProps {
  isOpen: boolean;
  area: DashboardAreaStatusItem | null;
  onClose: () => void;
}

export function AreaUnlockModal({ isOpen, area, onClose }: AreaUnlockModalProps) {
  const [unlockedThroughDate, setUnlockedThroughDate] = useState("");
  const [reason, setReason] = useState("");
  const unlockMutation = useUnlockAreaMutation();

  if (!area) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockedThroughDate || reason.trim().length < 5) return;
    unlockMutation.mutate(
      {
        areaId: area.areaId,
        payload: {
          unlockedThroughDate,
          reason: reason.trim(),
        },
      },
      {
        onSuccess: () => {
          setReason("");
          setUnlockedThroughDate("");
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
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <KeyRound className="h-5 w-5" />
              Buka Kunci Manual Laporan Area
            </DialogTitle>
            <DialogDescription className="text-xs">
              Area ini terkunci karena tertunggak lebih dari 3 hari kerja (BR-22).
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              <span>
                [{area.areaCode}] {area.areaName} — {area.projectName}
              </span>
            </div>
            <p className="mt-1">
              Jumlah hari tertunggak: <strong>{area.overdueBusinessDaysCount} hari</strong>. Tanggal
              tertunggak terlama: <strong>{area.oldestOverdueDate ?? "-"}</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unlockedThroughDate" className="text-xs font-semibold">
              Buka Kunci Hingga Tanggal (YYYY-MM-DD)
            </Label>
            <Input
              id="unlockedThroughDate"
              type="date"
              required
              value={unlockedThroughDate}
              onChange={(e) => setUnlockedThroughDate(e.target.value)}
            />
            <p className="text-[11px] text-text-muted">
              Supervisor akan dapat mengisi laporan mulai dari tanggal setelah tanggal ini.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-xs font-semibold">
              Alasan Dispensasi Pembukaan Kunci
            </Label>
            <textarea
              id="reason"
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Kendala cuaca ekstrem dan pemadaman listrik di lokasi proyek..."
              className="w-full rounded-md border border-border bg-surface-primary p-2 text-xs focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={unlockMutation.isPending || reason.trim().length < 5 || !unlockedThroughDate}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {unlockMutation.isPending ? "Membuka..." : "Buka Kunci Area"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
