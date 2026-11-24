import {
  Archive,
  BriefcaseBusiness,
  ClipboardList,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  ReceiptText,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types/api/auth.types";

export interface WorkspaceNavItem {
  href: string;
  label: string;
  icon?: LucideIcon;
  exact?: boolean;
}

export interface WorkspaceNavGroup {
  label: string;
  icon?: LucideIcon;
  collapsible?: boolean;
  showLabel?: boolean;
  items: WorkspaceNavItem[];
}

export function getGlobalNavGroups(role: UserRole, includeProjects = true): WorkspaceNavGroup[] {
  if (role === "SUPERVISOR") {
    return [
      { label: "Lapangan", collapsible: false, items: [
        { href: "/field/tasks", label: "Tugas Lapor", icon: ClipboardList },
        { href: "/field/history", label: "Riwayat Saya", icon: FileText },
      ] },
      ...(includeProjects ? [{ label: "Project", collapsible: false, items: [
        { href: "/projects", label: "Semua Project", icon: FolderKanban, exact: true },
      ] }] : []),
    ];
  }

  const workspaceItems: WorkspaceNavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/reports", label: "Laporan Harian", icon: FileText },
    { href: "/members", label: "Anggota Tim", icon: Users },
  ];
  if (includeProjects) {
    workspaceItems.push({ href: "/projects", label: "Semua Project", icon: FolderKanban, exact: true });
  }

  const groups: WorkspaceNavGroup[] = [{
    label: "Workspace",
    collapsible: false,
    showLabel: false,
    items: workspaceItems,
  }];
  if (role === "OWNER") {
    groups.push({
      label: "Human Resources",
      icon: BriefcaseBusiness,
      collapsible: true,
      items: [
        { href: "/hr/freelance/payment", label: "Freelance" },
        { href: "/hr/agent/payment", label: "Agent" },
      ],
    });
  }
  groups.push({
    label: "Arsip",
    collapsible: false,
    showLabel: false,
    items: [{ href: "/archive", label: "Archive Project", icon: Archive }],
  });
  return groups;
}

export function getProjectNavGroups(projectId: string, role: UserRole): WorkspaceNavGroup[] {
  const base = `/projects/${projectId}`;
  const groups: WorkspaceNavGroup[] = [
    {
      label: "Project",
      collapsible: true,
      items: [
        { href: base, label: "Overview & Area", icon: FolderKanban, exact: true },
        { href: `${base}/drawings`, label: "Drawing In/Out", icon: FileText },
      ],
    },
  ];
  if (role === "OWNER") {
    groups.push({
      label: "Document Out",
      collapsible: true,
      items: [{ href: `${base}/document-out`, label: "Quotation, BAST, Invoice", icon: ReceiptText, exact: true }],
    });
  }
  if (role !== "SUPERVISOR") {
    groups.push({
      label: "Document In",
      collapsible: true,
      items: [
        { href: `${base}/document-in/reports/daily`, label: "Daily Report", icon: ClipboardList },
        { href: `${base}/document-in/reports/monthly`, label: "Monthly Report", icon: FileText },
        ...(role === "OWNER"
          ? [{ href: `${base}/document-in/comms`, label: "Comms", icon: MessageSquareText }]
          : []),
      ],
    });
  }
  return groups;
}
