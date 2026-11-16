import { z } from "zod";

const projectCodeRegex = /^[a-zA-Z0-9_-]+$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Jakarta", label: "WIB — Asia/Jakarta (Jakarta, Sumatera, Jawa, Kalbar, Kalteng)" },
  { value: "Asia/Makassar", label: "WITA — Asia/Makassar (Bali, NTB, NTT, Sulsel, Kalsel, Kaltim)" },
  { value: "Asia/Jayapura", label: "WIT — Asia/Jayapura (Maluku, Papua)" },
] as const;

export const DAY_OF_WEEK_OPTIONS = [
  { value: 0, label: "Minggu" },
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" },
] as const;

export const projectFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, "Kode project minimal 2 karakter.")
      .max(20, "Kode project maksimal 20 karakter.")
      .regex(projectCodeRegex, "Kode hanya boleh huruf, angka, strip, atau underscore.")
      .transform((val) => val.toUpperCase()),
    name: z.string().trim().min(1, "Nama project wajib diisi.").max(100),
    location: z.string().trim().min(1, "Lokasi project wajib diisi.").max(200),
    clientName: z.string().trim().min(1, "Nama client wajib diisi.").max(100),
    startDate: z.string().regex(dateRegex, "Pilih tanggal mulai (YYYY-MM-DD)."),
    endDate: z
      .string()
      .optional()
      .refine(
        (val) => !val || dateRegex.test(val),
        "Format tanggal selesai harus YYYY-MM-DD.",
      ),
    status: z.enum(["PERSIAPAN", "BERJALAN", "SELESAI"]),
    timezone: z.string().min(1, "Pilih zona waktu project."),
    routineHolidays: z.array(z.number().int().min(0).max(6)),
  })
  .refine(
    (data) => {
      if (data.endDate && data.endDate.trim() !== "") {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "Tanggal selesai project tidak boleh lebih awal dari tanggal mulai.",
      path: ["endDate"],
    },
  );

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
