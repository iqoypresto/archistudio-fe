"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useLogoutMutation } from "@/hooks/auth.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { getRoleLabel, isFieldRole } from "@/lib/utils/role";
import { useAuthStore } from "@/stores/auth.store";
import { useSidebarNavStore } from "@/stores/sidebar-nav.store";
import type { AuthUserProfile, UserRole } from "@/types/api/auth.types";
import { FloatingAddProjectButton } from "./FloatingAddProjectButton";
import { OfficeSidebar } from "./OfficeSidebar";

export function OfficeAppShell({ children, projectId: propProjectId }: { children: ReactNode; projectId?: string }) {
  const router = useRouter();
  const params = useParams<{ projectId?: string }>();
  const activeProjectId = propProjectId ?? (typeof params?.projectId === "string" ? params.projectId : undefined);
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? "ADMIN";
  const projectQuery = useProjectDetailQuery(activeProjectId ?? "");
  const project = activeProjectId ? projectQuery.data : undefined;
  const projectTitle = project ? `${project.code} · ${project.name}` : activeProjectId ? "Project" : "Internal Office";
  const logoutMutation = useLogoutMutation();

  async function handleLogout(): Promise<void> {
    await logoutMutation.mutateAsync();
    useSidebarNavStore.getState().reset();
    router.replace("/login");
  }

  const content = activeProjectId ? (
    <AsyncStateView
      isLoading={projectQuery.isLoading}
      isError={projectQuery.isError}
      error={projectQuery.error}
      data={project}
      onRetry={() => projectQuery.refetch()}
      emptyTitle="Project tidak ditemukan"
      emptyDescription="Project tidak tersedia atau Anda tidak memiliki akses."
    >
      {() => children}
    </AsyncStateView>
  ) : (
    children
  );

  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-dvh bg-canvas lg:items-start lg:gap-4 lg:p-4">
        <OfficeSidebar
          role={role}
          projectId={activeProjectId}
          project={project}
          projectTitle={projectTitle}
          user={user}
          onLogout={handleLogout}
          isLoggingOut={logoutMutation.isPending}
        />
        <SidebarInset>
          <OfficeMobileTopbar role={role} projectTitle={projectTitle} user={user} />
          <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-24 sm:p-6 sm:pb-24 lg:px-6 lg:pt-3 lg:pb-24">{content}</main>
        </SidebarInset>
      </div>
      <FloatingAddProjectButton role={user?.role} />
    </SidebarProvider>
  );
}

function OfficeMobileTopbar({
  role,
  projectTitle,
  user,
}: {
  role: UserRole;
  projectTitle: string;
  user: AuthUserProfile | null;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-sidebar/95 px-4 backdrop-blur-md sm:px-6 lg:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        <SidebarTrigger className="size-11 rounded-xl border border-border bg-surface-input/90 hover:bg-surface-active/70" />
        <Link
          href={isFieldRole(role) ? "/field/home" : "/office/dashboard"}
          aria-label="ArchiStudio beranda"
          className="flex min-w-0 items-center gap-2"
        >
          <Image
            src="/brand/archistudio-logo.webp"
            alt=""
            width={28}
            height={28}
            className="size-7 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-tight tracking-tight text-text-primary">
              ArchiStudio
            </p>
            <p className="truncate text-[11px] leading-tight text-text-muted">
              {projectTitle}
            </p>
          </div>
        </Link>
      </div>
      {user && (
        <span
          title={`${user.name} · ${getRoleLabel(user.role)}`}
          aria-label={user.name}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-input text-xs font-semibold text-text-primary"
        >
          {getUserInitials(user.name)}
        </span>
      )}
    </header>
  );
}

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
