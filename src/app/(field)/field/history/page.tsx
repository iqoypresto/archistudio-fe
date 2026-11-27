import type { Metadata } from "next";
import { FieldHistoryContent } from "@/components/field/report/FieldHistoryContent";

export const instant = false;

export const metadata: Metadata = {
  title: "Riwayat Laporan | ArchiStudio Lapangan",
};

export default function FieldHistoryPage() {
  return <FieldHistoryContent />;
}
