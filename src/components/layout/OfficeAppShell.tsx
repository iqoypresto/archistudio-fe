"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Building2, LogOut, Menu } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useLogoutMutation } from "@/hooks/auth.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { useAuthStore } from "@/stores/auth.store";
import { ProjectNavList } from "./ProjectNavList";
import { ProjectNavigation } from "./ProjectNavigation";
import { WorkspaceBreadcrumbs } from "./WorkspaceBreadcrumbs";
import { getGlobalNavGroups, getProjectNavGroups } from "./workspace-nav.config";

export function OfficeAppShell({ children, projectId: propProjectId }: { children: ReactNode; projectId?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const params = useParams<{ projectId?: string }>();
  const activeProjectId = propProjectId ?? (typeof params?.projectId === "string" ? params.projectId : undefined);
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? "ADMIN";
  const isSupervisor = role === "SUPERVISOR";
  const projectQuery = useProjectDetailQuery(activeProjectId ?? "");
  const project = activeProjectId ? projectQuery.data : undefined;
  const navGroups = [
    ...getGlobalNavGroups(role, true),
    ...(activeProjectId ? getProjectNavGroups(activeProjectId, role) : []),
  ];
  const projectTitle = project ? `${project.code} · ${project.name}` : activeProjectId ? "Project" : undefined;
  const projectHref = activeProjectId ? `/projects/${activeProjectId}` : undefined;
  const logoutMutation = useLogoutMutation();

  async function handleLogout(): Promise<void> {
    await logoutMutation.mutateAsync();
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
    <div className="flex min-h-dvh bg-canvas lg:items-start lg:gap-4 lg:p-4">
      <aside className="sticky top-4 hidden h-[calc(100dvh-2rem)] w-64 shrink-0 flex-col overflow-hidden rounded-3xl border border-sidebar-border bg-sidebar shadow-xl lg:flex">
        <BrandHeader
          homeHref={isSupervisor ? "/field/tasks" : "/dashboard"}
          subtitle={projectTitle ?? "Internal Office"}
        />
        <div className="sidebar-scrollable min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-2">
          <ProjectNavList
            groups={getGlobalNavGroups(role, false)}
            largeTouchTarget={isSupervisor}
            layoutGroupId="office-desktop-global"
            resetKey={activeProjectId}
          />
          <ProjectNavigation
            projectId={activeProjectId}
            activeProject={project}
            role={role}
            largeTouchTarget={isSupervisor}
            layoutGroupId="office-desktop-project"
          />
        </div>
        {user && (
          <div className="p-3 pt-1">
            <div className="rounded-xl border border-border bg-surface p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-medium text-text-primary">{user.name}</p>
                <StatusBadge tone="info">{user.role}</StatusBadge>
              </div>
              <p className="mt-1 truncate text-[11px] text-text-muted">
                {projectTitle ?? "ArchiStudio Internal Office"}
              </p>
            </div>
          </div>
        )}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-13 items-center justify-between gap-3 border-b border-border/70 bg-canvas/85 px-4 backdrop-blur-md sm:px-6 lg:top-4">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-9 lg:hidden"
                    aria-label="Buka menu navigasi"
                  />
                }
              >
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent
                side="left"
                className="sidebar-scrollable data-[side=left]:inset-y-4 data-[side=left]:left-4 data-[side=left]:h-[calc(100dvh-2rem)] data-[side=left]:w-[min(18rem,calc(100vw-2rem))] gap-0 overflow-y-auto rounded-3xl border border-sidebar-border bg-sidebar p-0 shadow-2xl"
              >
                <SheetHeader className="border-b border-sidebar-border px-4 py-3.5">
                  <SheetTitle className="truncate text-sm">{projectTitle ?? "ArchiStudio Office"}</SheetTitle>
                  <WorkspaceBreadcrumbs
                    groups={navGroups}
                    projectTitle={projectTitle}
                    projectHref={projectHref}
                    className="text-left"
                  />
                </SheetHeader>
                <div className="space-y-4 p-3">
                  <ProjectNavList
                    groups={getGlobalNavGroups(role, false)}
                    onNavigate={() => setMobileOpen(false)}
                    largeTouchTarget={isSupervisor}
                    layoutGroupId="office-mobile-global"
                    resetKey={activeProjectId}
                  />
                  <ProjectNavigation
                    projectId={activeProjectId}
                    activeProject={project}
                    role={role}
                    onNavigate={() => setMobileOpen(false)}
                    largeTouchTarget={isSupervisor}
                    layoutGroupId="office-mobile-project"
                  />
                </div>
              </SheetContent>
            </Sheet>
            <WorkspaceBreadcrumbs groups={navGroups} projectTitle={projectTitle} projectHref={projectHref} />
          </div>
          <div className="flex shrink-0 items-center gap-2.5">
            {user && (
              <div className="hidden items-center gap-2 sm:flex">
                <span className="max-w-36 truncate text-xs font-medium text-text-secondary">{user.name}</span>
                <StatusBadge tone="info">{user.role}</StatusBadge>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="h-8 gap-1.5 border-border bg-surface px-2.5 text-xs text-text-secondary hover:bg-surface-active hover:text-text-primary"
            >
              <LogOut className="size-3.5" /> Keluar
            </Button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{content}</main>
      </div>
    </div>
  );
}

function BrandHeader({ homeHref, subtitle }: { homeHref: string; subtitle: string }) {
  return (
    <div className="p-3 pb-1">
      <Link
        href={homeHref}
        className="flex items-center justify-between rounded-xl border border-border bg-surface-input/90 px-3 py-2 transition-colors hover:bg-surface-active/70"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface-active text-text-primary ring-1 ring-white/[0.08]">
            <Building2 className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] leading-tight font-semibold tracking-tight text-text-primary">ArchiStudio</p>
            <p className="truncate text-[11px] leading-tight text-text-muted">{subtitle}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
