import { isFieldRole } from "@/lib/utils/role";
import type { UserRole } from "@/types/api/auth.types";

export function resolveLegacyProjectPath(
  role: UserRole,
  projectId?: string,
  segments: readonly string[] = [],
): string {
  const isField = isFieldRole(role);
  const root = `/${isField ? "field" : "office"}/projects`;
  const fieldSegmentIsSupported = segments[0] === "drawings" || segments[0] === "comms";
  const suffix = isField && !fieldSegmentIsSupported ? "" : segments.join("/");
  if (!projectId) return root;
  return `${root}/${projectId}${suffix ? `/${suffix}` : ""}`;
}
