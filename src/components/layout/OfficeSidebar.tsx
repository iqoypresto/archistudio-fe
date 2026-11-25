"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { getRoleLabel, isFieldRole } from "@/lib/utils/role";
import type { AuthUserProfile, UserRole } from "@/types/api/auth.types";
import type { ProjectListItem } from "@/types/api/project.types";
import { ProjectNavigation } from "./ProjectNavigation";
import { ProjectNavList } from "./ProjectNavList";
import { getGlobalNavGroups } from "./workspace-nav.config";

export function OfficeSidebar({
  role,
  projectId,
  project,
  projectTitle,
  user,
  onLogout,
  isLoggingOut,
}: {
  role: UserRole;
  projectId?: string;
  project?: ProjectListItem;
  projectTitle: string;
  user: AuthUserProfile | null;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  const closeOnNavigate = () => {
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="group-data-[collapsible=icon]/sidebar:justify-center flex min-w-0 items-center gap-2">
          <Link
            href={isFieldRole(role) ? "/field/home" : "/dashboard"}
            aria-label="ArchiStudio beranda"
            className="group-data-[collapsible=icon]/sidebar:size-9 group-data-[collapsible=icon]/sidebar:flex-none group-data-[collapsible=icon]/sidebar:justify-center group-data-[collapsible=icon]/sidebar:border-transparent group-data-[collapsible=icon]/sidebar:bg-transparent group-data-[collapsible=icon]/sidebar:p-0 flex min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-border bg-surface-input/90 px-2.5 py-2 transition-colors hover:bg-surface-active/70"
          >
            <Image src="/brand/archistudio-logo.webp" alt="" width={36} height={36} className="size-9 shrink-0 object-contain" />
            <div className="min-w-0 group-data-[collapsible=icon]/sidebar:hidden">
              <p className="text-[13px] font-semibold leading-tight tracking-tight text-text-primary">ArchiStudio</p>
              <p className="truncate text-[11px] leading-tight text-text-muted">{projectTitle}</p>
            </div>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ProjectNavList
          groups={getGlobalNavGroups(role, false)}
          onNavigate={closeOnNavigate}
          largeTouchTarget={isFieldRole(role)}
          layoutGroupId="office-global-navigation"
        />
        <ProjectNavigation
          projectId={projectId}
          activeProject={project}
          role={role}
          onNavigate={closeOnNavigate}
          largeTouchTarget={isFieldRole(role)}
          layoutGroupId="office-project-navigation"
        />
      </SidebarContent>

      {user && (
        <SidebarFooter>
          <AccountFooter user={user} onLogout={onLogout} isLoggingOut={isLoggingOut} />
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

function AccountFooter({
  user,
  onLogout,
  isLoggingOut,
}: {
  user: AuthUserProfile;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}) {
  const { open, isMobile } = useSidebar();
  const isCollapsed = !open && !isMobile;

  return (
    <div className={isCollapsed
      ? "flex flex-col items-center gap-2"
      : "flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-2.5"}
    >
      {isCollapsed ? (
        <span title={user.name} className="flex size-8 items-center justify-center text-text-secondary">
          <UserRound className="size-4" aria-hidden="true" />
        </span>
      ) : (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-text-primary">{user.name}</p>
          <p className="mt-1 truncate text-[11px] text-text-muted">{getRoleLabel(user.role)}</p>
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        size={isCollapsed ? "icon" : "sm"}
        onClick={onLogout}
        disabled={isLoggingOut}
        aria-label="Keluar"
        title="Keluar"
        className="shrink-0 gap-1.5 px-2.5 text-xs text-text-secondary hover:text-text-primary"
      >
        <LogOut className="size-3.5" />
        {!isCollapsed && <span>Keluar</span>}
      </Button>
    </div>
  );
}
