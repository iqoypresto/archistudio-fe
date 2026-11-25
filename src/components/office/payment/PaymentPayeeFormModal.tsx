"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  getPayeeTypeLabel,
  payeeFormSchema,
  type PayeeFormValues,
} from "@/lib/validation/payment.validation";
import type { CreatePayeePayload, PayeeType } from "@/types/api/payment.types";

interface PaymentPayeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  payeeType: PayeeType;
  onSubmit: (payload: CreatePayeePayload) => void;
  isSubmitting: boolean;
}

export function PaymentPayeeFormModal({
  isOpen,
  onClose,
  payeeType,
  onSubmit,
  isSubmitting,
}: PaymentPayeeFormModalProps) {
  const label = getPayeeTypeLabel(payeeType);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PayeeFormValues>({
    resolver: zodResolver(payeeFormSchema),
    defaultValues: { name: "", phone: "" },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: "", phone: "" });
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data: PayeeFormValues) => {
    onSubmit({
      type: payeeType,
      name: data.name,
      phone: data.phone && data.phone.trim() !== "" ? data.phone.trim() : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah {label}</DialogTitle>
          <DialogDescription className="text-xs">
            Data {label.toLowerCase()} dicatat global untuk keperluan pembayaran tanpa akun login.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="payee-name" className="text-xs font-medium">
                Nama {label}
              </Label>
              <span className="text-[11px] text-text-muted">Wajib</span>
            </div>
            <Input
              id="payee-name"
              placeholder="Contoh: Budi Santoso"
              className="h-9 text-xs"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-status-danger-fg">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="payee-phone" className="text-xs font-medium">
                Nomor HP
              </Label>
              <span className="text-[11px] text-text-muted">Opsional</span>
            </div>
            <Input
              id="payee-phone"
              type="tel"
              placeholder="Contoh: 081234567890"
              className="h-9 text-xs tabular-nums"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-status-danger-fg">{errors.phone.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9">
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-9">
              {isSubmitting ? "Menyimpan..." : `Simpan ${label}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
