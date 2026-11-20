"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, LogOut, Menu } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useLogoutMutation } from "@/hooks/auth.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { useAuthStore } from "@/stores/auth.store";
import { ProjectNavList } from "./ProjectNavList";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { WorkspaceBreadcrumbs } from "./WorkspaceBreadcrumbs";
import { getGlobalNavGroups, getProjectNavGroups } from "./workspace-nav.config";

export function ProjectWorkspaceShell({
  children,
  projectId,
}: {
  children: ReactNode;
  projectId?: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? "SUPERVISOR";
  const projectQuery = useProjectDetailQuery(projectId ?? "");
  const project = projectQuery.data;
  const logoutMutation = useLogoutMutation();
  const navGroups = [
    ...getGlobalNavGroups(role),
    ...(projectId ? getProjectNavGroups(projectId, role) : []),
  ];
  const title = project ? `${project.code} · ${project.name}` : projectId ? "Project" : "Semua Project";
  const projectHref = projectId ? `/projects/${projectId}` : undefined;
  const projectInsertAt = role === "OWNER" ? 2 : 1;

  async function handleLogout(): Promise<void> {
    await logoutMutation.mutateAsync();
    router.replace("/login");
  }

  const content = projectId ? (
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
  ) : children;

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="hidden w-80 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <BrandHeader homeHref={role === "SUPERVISOR" ? "/field/tasks" : "/dashboard"} />
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <ProjectNavList groups={navGroups.slice(0, projectInsertAt)} largeTouchTarget={role === "SUPERVISOR"} />
          <ProjectSwitcher activeProject={project} />
          <div className="border-t border-border pt-4">
            <ProjectNavList groups={navGroups.slice(projectInsertAt)} largeTouchTarget={role === "SUPERVISOR"} />
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button type="button" variant="outline" size="icon" className="min-h-11 min-w-11 lg:hidden" aria-label="Buka navigasi project" />}>
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-0">
                <SheetHeader className="border-b border-border px-5 py-4">
                  <SheetTitle>{title}</SheetTitle>
                  <WorkspaceBreadcrumbs groups={navGroups} projectTitle={title} projectHref={projectHref} className="text-left" />
                </SheetHeader>
                <div className="space-y-5 p-4">
                  <ProjectNavList groups={navGroups.slice(0, projectInsertAt)} largeTouchTarget={role === "SUPERVISOR"} />
                  <ProjectSwitcher activeProject={project} />
                  <div className="border-t border-border pt-4">
                    <ProjectNavList
                      groups={navGroups.slice(projectInsertAt)}
                      onNavigate={() => setMobileOpen(false)}
                      largeTouchTarget={role === "SUPERVISOR"}
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{title}</p>
              <WorkspaceBreadcrumbs groups={navGroups} projectTitle={title} projectHref={projectHref} />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {user && <div className="hidden items-center gap-2 sm:flex"><span className="max-w-40 truncate text-sm font-medium text-text-primary">{user.name}</span><StatusBadge tone="info">{user.role}</StatusBadge></div>}
            <Button type="button" variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending} className="min-h-11 px-3">
              <LogOut className="mr-1.5 size-4" /> Keluar
            </Button>
          </div>
        </header>
        <main className="w-full flex-1 p-4 sm:p-6">{content}</main>
      </div>
    </div>
  );
}

function BrandHeader({ homeHref }: { homeHref: string }) {
  return (
    <Link href={homeHref} className="flex h-16 items-center gap-3 border-b border-border px-5">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Building2 className="size-5" /></div>
      <div><p className="text-sm font-bold text-text-primary">ArchiStudio</p><p className="text-xs text-text-secondary">Project Workspace</p></div>
    </Link>
  );
}
