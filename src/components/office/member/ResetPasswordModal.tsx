"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ModalContextStrip, ModalNoteBox } from "@/components/ui/ModalContextStrip";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { getRoleLabel } from "@/lib/utils/role";
import { resetPasswordFormSchema, type ResetPasswordFormValues } from "@/lib/validation/user.validation";
import type { UserListItem } from "@/types/api/user.types";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: UserListItem | null;
  onSubmit: (userId: string, newPassword: string) => void;
  isSubmitting: boolean;
}

export function ResetPasswordModal({
  isOpen, onClose, targetUser, onSubmit, isSubmitting,
}: ResetPasswordModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    reset({ newPassword: "", confirmPassword: "" });
  }, [isOpen, reset]);

  const onFormSubmit = (data: ResetPasswordFormValues) => {
    if (!targetUser) return;
    onSubmit(targetUser.id, data.newPassword);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Kata Sandi</DialogTitle>
          <DialogDescription className="text-xs">
            Tetapkan kata sandi baru secara manual untuk akun berikut.
          </DialogDescription>
        </DialogHeader>

        {targetUser && (
          <ModalContextStrip
            kicker={`${getRoleLabel(targetUser.role)} · ${targetUser.jobTitle || "-"}`}
            title={targetUser.name}
            meta={`@${targetUser.username} · ${targetUser.phone || "-"}`}
          />
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-medium">Kata Sandi Baru</Label>
              <PasswordInput
                id="newPassword"
                toggleLabel="sandi baru"
                placeholder="Min. 6 karakter"
                className="h-9 text-xs"
                {...register("newPassword")}
              />
              {errors.newPassword && <p className="text-xs text-status-danger-fg">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-medium">Konfirmasi Sandi</Label>
              <PasswordInput
                id="confirmPassword"
                toggleLabel="konfirmasi sandi"
                placeholder="Ulangi sandi"
                className="h-9 text-xs"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-xs text-status-danger-fg">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <ModalNoteBox>
            Seluruh sesi login lama pengguna ini akan otomatis dicabut setelah kata sandi disimpan.
          </ModalNoteBox>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9">Batal</Button>
            <Button type="submit" disabled={isSubmitting} className="h-9">
              {isSubmitting ? "Menyimpan..." : "Simpan Kata Sandi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
