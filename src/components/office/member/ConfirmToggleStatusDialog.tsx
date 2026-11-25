"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModalContextStrip, ModalNoteBox } from "@/components/ui/ModalContextStrip";
import { getRoleLabel } from "@/lib/utils/role";
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
          <DialogDescription className="text-xs">
            {isCurrentlyActive
              ? "Akses masuk pengguna ini akan dihentikan sementara."
              : "Pengguna ini akan dapat masuk kembali ke sistem."}
          </DialogDescription>
        </DialogHeader>

        <ModalContextStrip
          kicker={`${getRoleLabel(targetUser.role)} · ${targetUser.jobTitle || "-"}`}
          title={targetUser.name}
          meta={`@${targetUser.username} · ${targetUser.phone || "-"}`}
        />

        <ModalNoteBox>
          {isCurrentlyActive
            ? "Akun yang dinonaktifkan tidak dapat login ke sistem. Seluruh riwayat laporan harian dan catatan tugas lapangan tetap aman dan tidak terhapus."
            : "Pengguna dapat segera login kembali menggunakan username dan kata sandi yang sudah terdaftar."}
        </ModalNoteBox>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9">
            Batal
          </Button>
          <Button
            type="button"
            variant={isCurrentlyActive ? "destructive" : "default"}
            onClick={() => onConfirm(targetUser.id, targetNextState)}
            disabled={isSubmitting}
            className="h-9"
          >
            {isSubmitting
              ? "Memproses..."
              : isCurrentlyActive
                ? "Nonaktifkan Akun"
                : "Aktifkan Akun"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
