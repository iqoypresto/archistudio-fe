"use client";

import type { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { AsyncStateView } from "@/components/ui/AsyncStateView";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useLogoutMutation } from "@/hooks/auth.hooks";
import { useProjectDetailQuery } from "@/hooks/project.hooks";
import { useAuthStore } from "@/stores/auth.store";
import { useSidebarNavStore } from "@/stores/sidebar-nav.store";
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
          <div className="px-4 pt-4 sm:px-6">
            <SidebarTrigger />
          </div>
          <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">{content}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
