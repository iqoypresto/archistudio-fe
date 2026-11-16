"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from "@/lib/validation/user.validation";
import type { UserListItem } from "@/types/api/user.types";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: UserListItem | null;
  onSubmit: (userId: string, newPassword: string) => void;
  isSubmitting: boolean;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  targetUser,
  onSubmit,
  isSubmitting,
}: ResetPasswordModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
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
          <DialogDescription>
            Atur kata sandi baru untuk <strong>{targetUser?.name}</strong> (@{targetUser?.username}).
            Seluruh sesi lama pengguna ini akan otomatis dicabut.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">Kata Sandi Baru</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Minimal 6 karakter"
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-status-danger-fg text-xs">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Ulangi kata sandi baru"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-status-danger-fg text-xs">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Mereset..." : "Simpan Kata Sandi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
