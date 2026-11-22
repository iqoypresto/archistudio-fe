"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLogoutMutation } from "@/hooks/auth.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthUserProfile } from "@/types/api/auth.types";
import { ProjectNavList } from "./ProjectNavList";
import { ProjectNavigation } from "./ProjectNavigation";
import { getGlobalNavGroups } from "./workspace-nav.config";

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
  const projectTitle = project ? `${project.code} · ${project.name}` : activeProjectId ? "Project" : undefined;
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
          <SidebarAccountFooter user={user} onLogout={handleLogout} isLoggingOut={logoutMutation.isPending} />
        )}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <div className="px-4 pt-4 sm:px-6 lg:hidden">
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-10"
                  aria-label="Buka menu navigasi"
                />
              }
            >
              <Menu className="size-4" />
            </SheetTrigger>
          </div>
          <SheetContent
            side="left"
            className="sidebar-scrollable data-[side=left]:inset-y-4 data-[side=left]:left-4 data-[side=left]:h-[calc(100dvh-2rem)] data-[side=left]:w-[min(18rem,calc(100vw-2rem))] flex flex-col gap-0 overflow-y-auto rounded-3xl border border-sidebar-border bg-sidebar p-0 shadow-2xl"
          >
            <SheetHeader className="border-b border-sidebar-border p-3">
              <SheetTitle className="sr-only">Navigasi utama</SheetTitle>
              <BrandHeader
                homeHref={isSupervisor ? "/field/tasks" : "/dashboard"}
                subtitle={projectTitle ?? "Internal Office"}
              />
            </SheetHeader>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
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
            {user && (
              <SidebarAccountFooter user={user} onLogout={handleLogout} isLoggingOut={logoutMutation.isPending} />
            )}
          </SheetContent>
        </Sheet>
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{content}</main>
      </div>
    </div>
  );
}

function SidebarAccountFooter({
  user,
  onLogout,
  isLoggingOut,
}: {
  user: AuthUserProfile;
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
}) {
  return (
    <div className="p-3 pt-1">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-text-primary">{user.name}</p>
          <p className="mt-1 truncate text-[11px] text-text-muted">{user.role}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onLogout}
          disabled={isLoggingOut}
          aria-label="Keluar"
          className="h-9 shrink-0 gap-1.5 px-2.5 text-xs text-text-secondary hover:text-text-primary"
        >
          <LogOut className="size-3.5" /> Keluar
        </Button>
      </div>
    </div>
  );
}

function BrandHeader({ homeHref, subtitle }: { homeHref: string; subtitle: string }) {
  return (
    <div className="p-3 pb-1">
      <Link
        href={homeHref}
        className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-input/90 px-3 py-2 transition-colors hover:bg-surface-active/70"
      >
        <Image
          src="/brand/archistudio-logo.webp"
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <p className="text-[13px] leading-tight font-semibold tracking-tight text-text-primary">ArchiStudio</p>
          <p className="truncate text-[11px] leading-tight text-text-muted">{subtitle}</p>
        </div>
      </Link>
    </div>
  );
}
