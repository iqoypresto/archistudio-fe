"use client";

import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMeQuery } from "@/hooks/auth.hooks";
import { ApiError } from "@/lib/api/api-error";
import { isFieldRole } from "@/lib/utils/role";
import { getDefaultRouteForRole, useAuthStore } from "@/stores/auth.store";
import type { UserRole } from "@/types/api/auth.types";
import { AuthBootstrapFallback, type AuthBootstrapScope } from "./AuthBootstrapFallback";

export type AuthScope = AuthBootstrapScope;

function computeRedirectPath(
  scope: AuthScope,
  role: UserRole | null
): string | null {
  if (!role) {
    return scope === "office" || scope === "field" || scope === "project" || scope === "root"
      ? "/login"
      : null;
  }
  if (scope === "guest" || scope === "root") {
    return getDefaultRouteForRole(role);
  }
  if (scope === "office" && isFieldRole(role)) {
    return "/field/home";
  }
  if (scope === "field" && !isFieldRole(role)) {
    return "/office/dashboard";
  }
  return null;
}

export function AuthBootstrap({
  scope,
  children,
}: {
  scope: AuthScope;
  children: ReactNode;
}) {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const hydrateFromStorage = useAuthStore((state) => state.hydrateFromStorage);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  const meQuery = useMeQuery(isHydrated);

  useLayoutEffect(() => {
    if (!isHydrated) {
      hydrateFromStorage();
    }
  }, [hydrateFromStorage, isHydrated]);

  useEffect(() => {
    if (meQuery.isSuccess && meQuery.data) {
      setUser(meQuery.data);
    }
  }, [meQuery.data, meQuery.isSuccess, setUser]);

  useEffect(() => {
    if (!meQuery.isError) return;
    const err = meQuery.error;
    if (
      err instanceof ApiError &&
      (err.statusCode === 401 || err.code === "ACCOUNT_INACTIVE")
    ) {
      clearSession();
    }
  }, [clearSession, meQuery.error, meQuery.isError]);

  const activeRole =
    accessToken ? (meQuery.data?.role ?? user?.role ?? null) : null;
  const redirectTarget = isHydrated
    ? computeRedirectPath(scope, activeRole)
    : null;

  useEffect(() => {
    if (redirectTarget) {
      router.replace(redirectTarget);
    }
  }, [redirectTarget, router]);

  const shouldBlockChildren =
    scope === "guest"
      ? Boolean(redirectTarget)
      : !isHydrated || Boolean(redirectTarget);

  if (shouldBlockChildren) {
    return <AuthBootstrapFallback scope={scope} />;
  }

  return <>{children}</>;
}
