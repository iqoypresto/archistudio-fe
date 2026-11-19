import { z } from "zod";

const areaCodeRegex = /^[a-zA-Z0-9_-]+$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const areaFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Kode area minimal 1 karakter.")
    .max(20, "Kode area maksimal 20 karakter.")
    .regex(areaCodeRegex, "Kode area hanya boleh huruf, angka, strip, atau underscore.")
    .transform((val) => val.toUpperCase()),
  name: z.string().trim().min(1, "Nama area wajib diisi.").max(100),
  initialSupervisorId: z.string().optional(),
  startDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || dateRegex.test(val),
      "Format tanggal mulai harus YYYY-MM-DD.",
    ),
});

export type AreaFormValues = z.infer<typeof areaFormSchema>;

export const assignSupervisorFormSchema = z.object({
  supervisorId: z.string().min(1, "Pilih supervisor aktif."),
  effectiveStartDate: z
    .string()
    .regex(dateRegex, "Format tanggal efektif harus YYYY-MM-DD."),
});

export type AssignSupervisorFormValues = z.infer<typeof assignSupervisorFormSchema>;
