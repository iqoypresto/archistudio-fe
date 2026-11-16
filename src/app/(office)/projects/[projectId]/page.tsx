import { ProjectDetailContent } from "@/components/office/project/ProjectDetailContent";

interface ProjectDetailPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = await params;
  return <ProjectDetailContent projectId={projectId} />;
}
