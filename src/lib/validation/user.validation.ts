import { z } from "zod";

const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
const phoneRegex = /^[0-9+]+$/;

export const memberFormSchema = z.object({
  name: z.string().trim().min(1, "Nama lengkap wajib diisi.").max(100),
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(50)
    .regex(usernameRegex, "Username hanya boleh huruf, angka, titik, strip, atau underscore."),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor HP minimal 8 karakter.")
    .max(20)
    .regex(phoneRegex, "Nomor HP hanya boleh berisi angka dan tanda plus (+)."),
  role: z.enum(["ADMIN", "SUPERVISOR"]),
  jobTitle: z.string().trim().max(50).optional(),
  password: z.string().optional(),
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;

export const resetPasswordFormSchema = z
  .object({
    newPassword: z.string().min(6, "Kata sandi minimal 6 karakter.").max(100),
    confirmPassword: z.string().min(6, "Konfirmasi kata sandi minimal 6 karakter.").max(100),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi baru tidak sesuai.",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
