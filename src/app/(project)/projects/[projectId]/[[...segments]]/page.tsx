import { LegacyProjectRedirect } from "@/components/routing/LegacyProjectRedirect";

export const instant = false;

export default async function LegacyProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; segments?: string[] }>;
}) {
  const { projectId, segments } = await params;
  return <LegacyProjectRedirect projectId={projectId} segments={segments} />;
}
