import { CalendarDays, ClipboardList, House, Layers3 } from "lucide-react";

export const FIELD_BOTTOM_TABS = [
  { href: "/field/home", label: "Beranda", icon: House },
  { href: "/field/reports", label: "Laporan", icon: ClipboardList },
  { href: "/field/history", label: "Riwayat", icon: CalendarDays },
  { href: "/field/projects", label: "Project", icon: Layers3 },
] as const;
