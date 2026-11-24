import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Laporan Berhasil Dikirim | ArchiStudio" };

export default function ReportSuccessPage() {
  redirect("/field/reports");
}
