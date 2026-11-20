"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
          <DialogDescription>
            Data {label.toLowerCase()} dicatat secara global tanpa akun login maupun relasi
            project (BR-06, BR-36).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="payee-name">Nama {label} *</Label>
            <Input
              id="payee-name"
              placeholder={`Contoh: Budi (${label})`}
              className="h-11"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-status-danger-fg text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payee-phone">Nomor HP (Opsional)</Label>
            <Input
              id="payee-phone"
              type="tel"
              placeholder="Contoh: 081234567890"
              className="h-11"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-status-danger-fg text-xs">{errors.phone.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : `Simpan ${label}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
