import { CommsContent } from "@/components/project/comms/CommsContent";

export const instant = false;

export default async function ProjectCommsInPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <CommsContent projectId={projectId} fixedDirection="INBOUND" />;
}
