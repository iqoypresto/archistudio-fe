import { FieldCommsDocumentsContent } from "@/components/project/comms/FieldCommsDocumentsContent";

export const instant = false;

export default async function FieldProjectCommsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <FieldCommsDocumentsContent projectId={projectId} />;
}
