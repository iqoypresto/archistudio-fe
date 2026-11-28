import { PageInfoDialog } from "@/components/ui/PageInfoDialog";

const DASHBOARD_INFO_POINTS = [
  "Status laporan hari ini untuk setiap area.",
  "Filter project dan status untuk mempersempit daftar area.",
  "Rekap keterlambatan supervisor dan area yang tertunggak.",
  "Export PDF laporan berdasarkan project dan tanggal pilihan.",
];

export function DashboardInfoDialog() {
  return (
    <PageInfoDialog
      title="Tentang Dashboard Monitoring"
      description="Ringkasan operasional proyek berjalan, kelengkapan laporan harian, tim internal, dan indikator lintas sistem."
      points={DASHBOARD_INFO_POINTS}
    />
  );
}
