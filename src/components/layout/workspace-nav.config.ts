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
import { isCommsAllowedRole, isFieldRole } from "@/lib/utils/role";
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
  if (isFieldRole(role)) {
    return [
      { label: "Lapangan", collapsible: false, items: [
        { href: "/field/home", label: "Home", icon: LayoutDashboard, exact: true },
        { href: "/field/reports", label: "Laporan", icon: ClipboardList },
        { href: "/field/history", label: "Riwayat", icon: FileText },
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
      collapsible: false,
      showLabel: false,
      items: [
        { href: base, label: "Overview & Area", exact: true },
        { href: `${base}/drawings`, label: "Drawing" },
      ],
    },
  ];
  if (isCommsAllowedRole(role)) {
    groups.push({
      label: "Comms",
      icon: MessageSquareText,
      collapsible: true,
      items: [
        { href: `${base}/comms/in`, label: "Comms In" },
        { href: `${base}/comms/out`, label: "Comms Out" },
      ],
    });
  }
  if (role === "OWNER") {
    groups.push({
      label: "Document Out",
      icon: ReceiptText,
      collapsible: true,
      items: [{ href: `${base}/document-out`, label: "Quotation, BAST, Invoice", exact: true }],
    });
  }
  if (!isFieldRole(role)) {
    groups.push({
      label: "Document In",
      icon: ClipboardList,
      collapsible: true,
      items: [
        { href: `${base}/document-in/reports/daily`, label: "Daily Report" },
        { href: `${base}/document-in/reports/monthly`, label: "Monthly Report" },
      ],
    });
  }
  return groups;
}
