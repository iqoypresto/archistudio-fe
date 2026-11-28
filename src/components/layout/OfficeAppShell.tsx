"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useLogoutMutation } from "@/hooks/auth.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { getRoleLabel, isFieldRole } from "@/lib/utils/role";
import { useAuthStore } from "@/stores/auth.store";
import { useSidebarNavStore } from "@/stores/sidebar-nav.store";
import type { AuthUserProfile, UserRole } from "@/types/api/auth.types";
import { FloatingAddProjectButton } from "./FloatingAddProjectButton";
import { OfficeSidebar } from "./OfficeSidebar";
import { WorkspaceBreadcrumbs } from "./WorkspaceBreadcrumbs";
import { getGlobalNavGroups, getProjectNavGroups } from "./workspace-nav.config";

export function OfficeAppShell({ children, projectId: propProjectId }: { children: ReactNode; projectId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();
  const activeProjectId = propProjectId ?? (typeof params?.projectId === "string" ? params.projectId : undefined);
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? "ADMIN";
  const projectQuery = useProjectDetailQuery(activeProjectId ?? "");
  const project = activeProjectId ? projectQuery.data : undefined;
  const projectTitle = project ? `${project.code} · ${project.name}` : activeProjectId ? "Project" : "Internal Office";
  const logoutMutation = useLogoutMutation();
  const breadcrumbGroups = activeProjectId
    ? getProjectNavGroups(activeProjectId, role)
    : getGlobalNavGroups(role, true);
  const showMobileBreadcrumbs = pathname !== "/office/dashboard" && pathname !== "/dashboard";

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
          <main className="mx-auto w-full max-w-7xl flex-1 p-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:p-6 sm:pb-24 lg:px-6 lg:pt-3 lg:pb-24">
            {showMobileBreadcrumbs && (
              <WorkspaceBreadcrumbs
                groups={breadcrumbGroups}
                projectTitle={activeProjectId ? projectTitle : undefined}
                projectHref={activeProjectId ? `/office/projects/${activeProjectId}` : undefined}
                className="mb-3 lg:hidden"
              />
            )}
            {content}
          </main>
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
  const { setOpenMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-sidebar/95 pt-[env(safe-area-inset-top)] backdrop-blur-md lg:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <SidebarTrigger className="size-11 rounded-xl border border-border bg-surface-input/90 hover:bg-surface-active/70" />
          <Link
            href={isFieldRole(role) ? "/field/home" : "/office/dashboard"}
            aria-label="ArchiStudio beranda"
            className="flex min-w-0 items-center gap-2 rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          <button
            type="button"
            onClick={() => setOpenMobile(true)}
            title={`${user.name} · ${getRoleLabel(user.role)}`}
            aria-label={`Buka menu akun dan navigasi (${user.name})`}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface-input text-xs font-semibold text-text-primary transition-colors hover:bg-surface-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {getUserInitials(user.name)}
          </button>
        )}
      </div>
    </header>
  );
}

function getUserInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}
