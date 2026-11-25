"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { resolveLegacyProjectPath } from "@/lib/routing/legacy-project-path";
import { useAuthStore } from "@/stores/auth.store";

export function LegacyProjectRedirect({
  projectId,
  segments = [],
}: {
  projectId?: string;
  segments?: string[];
}) {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  useEffect(() => {
    if (!isHydrated || !role) return;
    router.replace(resolveLegacyProjectPath(role, projectId, segments));
  }, [isHydrated, projectId, role, router, segments]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-text-secondary" role="status">
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      Membuka project...
    </div>
  );
}
