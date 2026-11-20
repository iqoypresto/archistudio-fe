"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, LogOut, Menu } from "lucide-react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useLogoutMutation } from "@/hooks/auth.hooks";
import { useAuthStore } from "@/stores/auth.store";
import { ProjectNavList } from "./ProjectNavList";
import { ProjectNavigation } from "./ProjectNavigation";
import { WorkspaceBreadcrumbs } from "./WorkspaceBreadcrumbs";
import { getGlobalNavGroups } from "./workspace-nav.config";

export function OfficeAppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const user = useAuthStore((state) => state.user);
  const role = user?.role ?? "ADMIN";
  const navGroups = getGlobalNavGroups(role);
  const logoutMutation = useLogoutMutation();

  async function handleLogout(): Promise<void> {
    await logoutMutation.mutateAsync();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-surface lg:flex">
        <BrandHeader />
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <ProjectNavList groups={navGroups} layoutGroupId="office-desktop-sidebar" />
          <ProjectNavigation role={role} layoutGroupId="office-desktop-sidebar" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={<Button type="button" variant="outline" size="icon" className="min-h-11 min-w-11 lg:hidden" aria-label="Buka menu navigasi" />}>
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto p-0">
                <SheetHeader className="border-b border-border px-5 py-4">
                  <SheetTitle>ArchiStudio Office</SheetTitle>
                  <WorkspaceBreadcrumbs groups={navGroups} className="text-left" />
                </SheetHeader>
                <div className="space-y-5 p-4">
                  <ProjectNavList groups={navGroups} onNavigate={() => setMobileOpen(false)} layoutGroupId="office-mobile-sidebar" />
                  <ProjectNavigation role={role} onNavigate={() => setMobileOpen(false)} layoutGroupId="office-mobile-sidebar" />
                </div>
              </SheetContent>
            </Sheet>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary">ArchiStudio Office</p>
              <WorkspaceBreadcrumbs groups={navGroups} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && <div className="hidden items-center gap-2 sm:flex"><span className="text-sm font-medium text-text-primary">{user.name}</span><StatusBadge tone="info">{user.role}</StatusBadge></div>}
            <Button type="button" variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending} className="min-h-11 px-3">
              <LogOut className="mr-1.5 size-4" /> Keluar
            </Button>
          </div>
        </header>
        <MotionConfig reducedMotion="user">
          <motion.main key={pathname} initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }} className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
            {children}
          </motion.main>
        </MotionConfig>
      </div>
    </div>
  );
}

function BrandHeader() {
  return (
    <Link href="/dashboard" className="flex h-16 items-center gap-3 border-b border-border px-5">
      <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Building2 className="size-5" /></div>
      <div><p className="text-sm font-bold text-text-primary">ArchiStudio</p><p className="text-xs text-text-secondary">Internal Office</p></div>
    </Link>
  );
}
