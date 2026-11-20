import { z } from "zod";
import type { UserRole } from "@/types/api/auth.types";
import type { PayeeType, PaymentProofMime } from "@/types/api/payment.types";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_REGEX = /^[0-9+\-\s()]{6,25}$/;

export const ALLOWED_PAYMENT_PROOF_MIMES: readonly PaymentProofMime[] = [
  "image/jpeg",
  "image/png",
];
export const MAX_PAYMENT_PROOF_BYTES = 2 * 1024 * 1024;

export const payeeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi.")
    .max(120, "Nama maksimal 120 karakter."),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || PHONE_REGEX.test(val),
      "Format nomor HP tidak valid (6–25 digit).",
    ),
});

export type PayeeFormValues = z.infer<typeof payeeFormSchema>;

export const paymentRecordFormSchema = z.object({
  status: z.enum(["PAID", "UNPAID"]),
  amount: z
    .string()
    .trim()
    .min(1, "Nominal pembayaran wajib diisi.")
    .refine((val) => {
      const parsed = Number(val);
      return Number.isFinite(parsed) && parsed > 0;
    }, "Nominal harus berupa angka lebih dari 0."),
  recordDate: z.string().regex(DATE_REGEX, "Format tanggal harus YYYY-MM-DD."),
  dueDate: z
    .string()
    .optional()
    .refine((val) => !val || DATE_REGEX.test(val), "Format jatuh tempo harus YYYY-MM-DD."),
});

export type PaymentRecordFormValues = z.infer<typeof paymentRecordFormSchema>;

/** Memeriksa apakah role berwenang mengakses modul pembayaran global (BR-36). */
export function canAccessPayments(role?: UserRole | null): boolean {
  return role === "OWNER";
}

/** Memvalidasi berkas bukti pembayaran (hanya JPG/PNG, maks. 2 MB) (BR-36). */
export function validatePaymentProofFile(file: {
  type: string;
  size: number;
}): { valid: true; mimeType: PaymentProofMime } | { valid: false; message: string } {
  if (!ALLOWED_PAYMENT_PROOF_MIMES.includes(file.type as PaymentProofMime)) {
    return {
      valid: false,
      message: "Bukti pembayaran hanya mendukung file JPG atau PNG (BR-36).",
    };
  }
  if (file.size <= 0 || file.size > MAX_PAYMENT_PROOF_BYTES) {
    return {
      valid: false,
      message: "Ukuran file bukti pembayaran maksimal 2 MB (BR-36).",
    };
  }
  return { valid: true, mimeType: file.type as PaymentProofMime };
}

export function formatCurrencyIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getPayeeTypeLabel(type: PayeeType): string {
  return type === "FREELANCE" ? "Freelance" : "Agent";
}
