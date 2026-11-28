"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useSyncExternalStore, type ReactNode } from "react";
import { useState } from "react";

const SIDEBAR_COOKIE = "archistudio-office-sidebar";
const MOBILE_QUERY = "(max-width: 1023px)";
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function subscribeToViewport(onChange: () => void): () => void {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getMobileSnapshot(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerMobileSnapshot(): boolean {
  return false;
}

function readSavedState(): boolean | null {
  const value = document.cookie.split("; ").find((item) => item.startsWith(`${SIDEBAR_COOKIE}=`))?.split("=")[1];
  return value === "open" ? true : value === "closed" ? false : null;
}

function saveState(open: boolean): void {
  document.cookie = `${SIDEBAR_COOKIE}=${open ? "open" : "closed"}; path=/; max-age=31536000; samesite=lax`;
}

export function SidebarProvider({ children, defaultOpen = true }: { children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpenState] = useState(defaultOpen);
  const [openMobile, setOpenMobile] = useState(false);
  const isMobile = useSyncExternalStore(subscribeToViewport, getMobileSnapshot, getServerMobileSnapshot);

  useIsomorphicLayoutEffect(() => {
    const saved = readSavedState();
    if (saved !== null) setOpenState(saved);
  }, []);

  const setOpen = useCallback((nextOpen: boolean) => {
    saveState(nextOpen);
    setOpenState(nextOpen);
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((current) => !current);
    else setOpen(!open);
  }, [isMobile, open, setOpen, setOpenMobile]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <SidebarContext.Provider value={{ open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar harus digunakan di dalam SidebarProvider.");
  return context;
}
