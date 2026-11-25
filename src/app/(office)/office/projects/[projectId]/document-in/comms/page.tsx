import { redirect } from "next/navigation";

export const instant = false;

export default async function LegacyProjectCommsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/office/projects/${projectId}/comms/in`);
}
