"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { UserListItem } from "@/types/api/user.types";

interface ConfirmToggleStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: UserListItem | null;
  onConfirm: (userId: string, newActiveStatus: boolean) => void;
  isSubmitting: boolean;
}

export function ConfirmToggleStatusDialog({
  isOpen,
  onClose,
  targetUser,
  onConfirm,
  isSubmitting,
}: ConfirmToggleStatusDialogProps) {
  if (!targetUser) return null;

  const isCurrentlyActive = targetUser.isActive;
  const targetNextState = !isCurrentlyActive;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCurrentlyActive ? "Nonaktifkan Akun Pengguna?" : "Aktifkan Kembali Akun?"}
          </DialogTitle>
          <DialogDescription className="space-y-2 pt-2 text-sm">
            <span>
              Anda akan {isCurrentlyActive ? "menonaktifkan" : "mengaktifkan"} akun{" "}
              <strong>{targetUser.name}</strong> (@{targetUser.username}).
            </span>
            {isCurrentlyActive ? (
              <span className="bg-status-warning-bg text-status-warning-fg block rounded-lg p-2.5 text-xs font-medium">
                Akun yang dinonaktifkan tidak dapat login ke sistem. Seluruh riwayat laporan
                harian dan catatan tugas lapangan tetap aman dan tidak terhapus (BR-05).
              </span>
            ) : (
              <span className="bg-status-success-bg text-status-success-fg block rounded-lg p-2.5 text-xs font-medium">
                Pengguna akan dapat segera login kembali menggunakan kredensial akun yang sudah ada.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            variant={isCurrentlyActive ? "destructive" : "default"}
            onClick={() => onConfirm(targetUser.id, targetNextState)}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Memproses..."
              : isCurrentlyActive
                ? "Ya, Nonaktifkan"
                : "Ya, Aktifkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
