import { DrawingGalleryContent } from "@/components/project/drawing/DrawingGalleryContent";

export const instant = false;

export default async function DrawingsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <DrawingGalleryContent projectId={projectId} />;
}
