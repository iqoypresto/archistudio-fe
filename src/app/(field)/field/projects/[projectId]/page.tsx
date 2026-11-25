import { SupervisorProjectDetailContent } from "@/components/field/project/SupervisorProjectDetailContent";

export const instant = false;

export default async function FieldProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <SupervisorProjectDetailContent projectId={projectId} />;
}
