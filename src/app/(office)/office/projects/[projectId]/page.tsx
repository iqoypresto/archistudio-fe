import { ProjectDetailContent } from "@/components/office/project/ProjectDetailContent";

export const instant = false;

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectDetailContent projectId={projectId} />;
}
