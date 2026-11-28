"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SidebarProvider, useSidebar } from "./sidebar-context";

export { SidebarProvider, useSidebar };

export function Sidebar({ children, className }: { children: ReactNode; className?: string }) {
  const { open, isMobile, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className={cn(
            "sidebar-scrollable data-[side=left]:inset-y-4 data-[side=left]:left-4 data-[side=left]:h-[calc(100dvh-2rem)] data-[side=left]:w-[min(18rem,calc(100vw-2rem))] gap-0 overflow-y-auto rounded-3xl border border-sidebar-border bg-sidebar p-0 shadow-2xl",
            className,
          )}
        >
          <div data-slot="sidebar" data-mobile="true" className="flex h-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      data-slot="sidebar"
      data-state={open ? "expanded" : "collapsed"}
      data-collapsible={!open ? "icon" : undefined}
      className={cn(
        "group/sidebar sticky top-4 hidden h-[calc(100dvh-2rem)] shrink-0 flex-col overflow-hidden rounded-3xl border border-sidebar-border bg-sidebar shadow-xl transition-[width] duration-200 ease-linear motion-reduce:transition-none lg:flex",
        open ? "w-64" : "w-[4.5rem]",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function SidebarTrigger({ className, ...props }: ComponentProps<typeof Button>) {
  const { open, isMobile, setOpen, setOpenMobile } = useSidebar();
  const label = isMobile ? "Buka menu navigasi" : open ? "Ciutkan sidebar" : "Buka sidebar";
  const Icon = isMobile ? Menu : open ? PanelLeftClose : PanelLeftOpen;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={isMobile ? label : `${label} (⌘B / Ctrl+B)`}
      onClick={() => (isMobile ? setOpenMobile(true) : setOpen(!open))}
      className={cn("size-10 shrink-0 text-text-secondary hover:bg-surface-active hover:text-text-primary", className)}
      {...props}
    >
      <Icon className="size-4" aria-hidden="true" />
    </Button>
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sidebar-header" className={cn("shrink-0 p-3", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn("sidebar-scrollable min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-2", className)}
      {...props}
    />
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" className={cn("mt-auto shrink-0 p-3 pt-1", className)} {...props} />;
}

export function SidebarGroup({ className, ...props }: ComponentProps<"section">) {
  return <section data-slot="sidebar-group" className={cn("min-w-0", className)} {...props} />;
}

export function SidebarGroupLabel({ className, ...props }: ComponentProps<"div">) {
  const { open, isMobile } = useSidebar();
  if (!open && !isMobile) return null;
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn("mb-1 flex min-h-10 items-center gap-3 px-3 text-xs font-semibold uppercase tracking-wide text-text-muted", className)}
      {...props}
    />
  );
}

export function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" className={cn("space-y-1", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" className={cn("relative min-w-0", className)} {...props} />;
}

export function SidebarMenuButton({
  className,
  isActive = false,
  ...props
}: ComponentProps<typeof Button> & { isActive?: boolean }) {
  const { open, isMobile } = useSidebar();
  const isCollapsed = !open && !isMobile;

  return (
    <Button
      data-slot="sidebar-menu-button"
      data-active={isActive}
      variant="ghost"
      className={cn(
        "relative z-10 flex min-h-11 w-full items-center justify-start gap-3 overflow-hidden rounded-lg px-3 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-surface-active hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "font-semibold text-text-primary",
        isCollapsed && "justify-center px-0",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMenuSub({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn("ml-3 space-y-1 border-l border-border pl-3", className)}
      {...props}
    />
  );
}

export function SidebarInset({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sidebar-inset" className={cn("flex min-w-0 flex-1 flex-col", className)} {...props} />;
}
