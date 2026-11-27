import { FieldDrawingListContent } from "@/components/project/drawing/FieldDrawingListContent";

export const instant = false;

export default async function FieldProjectDrawingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <FieldDrawingListContent projectId={projectId} />;
}
