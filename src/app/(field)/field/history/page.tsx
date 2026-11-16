import type { Metadata } from "next";
import { FieldHistoryContent } from "@/components/field/report/FieldHistoryContent";

export const metadata: Metadata = {
  title: "Riwayat Saya | ArchiStudio Lapangan",
};

export default function FieldHistoryPage() {
  return <FieldHistoryContent />;
}
