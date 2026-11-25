import { DocumentOutContent } from "@/components/project/document-out/DocumentOutContent";

export const instant = false;

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <DocumentOutContent projectId={projectId} />;
}
