"use client";

import { useLayoutEffect, useSyncExternalStore, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { LoginSplashOverlay } from "@/components/auth/LoginSplashOverlay";
import { ARCHISTUDIO_AUTH_STORAGE_KEY, useAuthStore } from "@/stores/auth.store";

const SESSION_KEY = "archistudio:login-splash-seen";
const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function hasStoredSession(): boolean {
  const storedAuth = window.localStorage.getItem(ARCHISTUDIO_AUTH_STORAGE_KEY);
  if (!storedAuth) return false;
  try {
    const parsed: unknown = JSON.parse(storedAuth);
    return isStoredSession(parsed);
  } catch {
    return false;
  }
}

function shouldShowSplash(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  if (!window.matchMedia(MOBILE_QUERY).matches) return false;

  try {
    if (hasStoredSession()) return false;
    const storage = window.sessionStorage;
    if (storage.getItem(SESSION_KEY)) return false;
    storage.setItem(SESSION_KEY, "1");
    return !window.matchMedia(REDUCED_MOTION_QUERY).matches;
  } catch {
    return false;
  }
}

function isStoredSession(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return typeof payload.accessToken === "string" && typeof payload.refreshToken === "string";
}

function subscribeToSplashState(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-login-splash-skip", "data-login-splash-exit"],
  });
  return () => observer.disconnect();
}

function getSplashSnapshot(): number {
  const root = document.documentElement;
  const visible = root.dataset.loginSplashSkip !== "true";
  const animateExit = root.dataset.loginSplashExit !== "false";
  return Number(visible) + Number(animateExit) * 2;
}

function setSplashDocumentState(isVisible: boolean, animateExit: boolean): void {
  const root = document.documentElement;
  root.dataset.loginSplashSkip = String(!isVisible);
  root.dataset.loginSplashExit = String(animateExit);
}

function getServerSplashSnapshot(): number {
  return 1;
}

export function LoginSplashLayer({ children }: { children: ReactNode }) {
  const isAuthHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const snapshot = useSyncExternalStore(
    subscribeToSplashState,
    getSplashSnapshot,
    getServerSplashSnapshot
  );
  const isVisible = (snapshot & 1) === 1;
  const animateExit = (snapshot & 2) === 2;

  useLayoutEffect(() => {
    if (!isAuthHydrated) return;
    const shouldShow = shouldShowSplash();
    setSplashDocumentState(shouldShow, shouldShow);
  }, [accessToken, isAuthHydrated]);

  return (
    <MotionConfig reducedMotion="user">
      {children}
      <LoginSplashOverlay
        animateExit={animateExit}
        isVisible={isVisible}
        onLogoAnimationComplete={() => setSplashDocumentState(false, true)}
      />
    </MotionConfig>
  );
}
