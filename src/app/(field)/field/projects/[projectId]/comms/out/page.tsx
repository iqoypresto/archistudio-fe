import { redirect } from "next/navigation";

export const instant = false;

export default async function FieldProjectCommsOutPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/field/projects/${projectId}/comms`);
}
