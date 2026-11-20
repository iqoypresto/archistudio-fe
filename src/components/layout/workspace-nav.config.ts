import {
  Archive,
  ClipboardList,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  ReceiptText,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/api/auth.types";

export interface WorkspaceNavItem {
  href?: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  children?: WorkspaceNavItem[];
  toggleOnly?: boolean;
}

export interface WorkspaceNavGroup {
  label: string;
  items: WorkspaceNavItem[];
}

export function getGlobalNavGroups(role: UserRole, includeProjects = true): WorkspaceNavGroup[] {
  if (role === "SUPERVISOR") {
    return [
      { label: "Lapangan", items: [
        { href: "/field/tasks", label: "Tugas Lapor", icon: ClipboardList },
        { href: "/field/history", label: "Riwayat Saya", icon: FileText },
      ] },
      ...(includeProjects ? [{ label: "Project", items: [
        { href: "/projects", label: "Semua Project", icon: FolderKanban, exact: true },
      ] }] : []),
    ];
  }

  const groups: WorkspaceNavGroup[] = [
    { label: "", items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/members", label: "Anggota Tim", icon: Users },
    ] },
  ];
  if (role === "OWNER") {
    groups.push({ label: "", items: [
      { label: "Human Resource", icon: Wallet, toggleOnly: true, children: [
        { href: "/hr/freelance/payment", label: "Freelance", icon: Wallet },
        { href: "/hr/agent/payment", label: "Agent", icon: ReceiptText },
      ] },
    ] });
  }
  groups.push({ label: "", items: [
    { label: "Arsip", icon: Archive, toggleOnly: true, children: getArchiveYearLinks() },
  ] });
  return groups;
}

export function getProjectNavGroups(projectId: string, role: UserRole): WorkspaceNavGroup[] {
  const base = `/projects/${projectId}`;
  const groups: WorkspaceNavGroup[] = [
    { label: "Project", items: [
      { href: base, label: "Overview & Area", icon: FolderKanban, exact: true },
      { label: "Drawing", icon: FileText, toggleOnly: true, children: [
        { href: `${base}/drawings?tab=masuk`, label: "Masuk", icon: FileText },
        { href: `${base}/drawings?tab=keluar`, label: "Keluar", icon: FileText },
      ] },
    ] },
  ];
  if (role === "OWNER") {
    groups.push({ label: "Document Out", items: [
      { label: "Dokumen Keluar", icon: ReceiptText, toggleOnly: true, children: [
        { href: `${base}/document-out?tab=quotation`, label: "Quotation", icon: ReceiptText },
        { href: `${base}/document-out?tab=bast`, label: "BAST", icon: ReceiptText },
        { href: `${base}/document-out?tab=invoice`, label: "Invoice", icon: ReceiptText },
      ] },
    ] });
  }
  if (role !== "SUPERVISOR") {
    groups.push({ label: "Document In", items: [
      { label: "Dokumen Masuk", icon: ClipboardList, toggleOnly: true, children: [
        { href: `${base}/document-in/reports/daily`, label: "Laporan Proyek · Harian", icon: ClipboardList },
        { href: `${base}/document-in/reports/monthly`, label: "Laporan Proyek · Bulanan", icon: FileText },
        ...(role === "OWNER" ? [{ href: `${base}/document-in/comms`, label: "Komunikasi", icon: MessageSquareText }] : []),
      ] },
    ] });
  }
  return groups;
}

function getArchiveYearLinks(): WorkspaceNavItem[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 2026 + 2 }, (_, index) => currentYear - index + 1)
    .filter((year) => year >= 2026)
    .map((year) => ({ href: `/archive?year=${year}`, label: String(year), icon: Archive }));
}
