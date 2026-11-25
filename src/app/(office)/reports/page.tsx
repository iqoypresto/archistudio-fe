import { redirect } from "next/navigation";

export default async function LegacyReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  redirect(`/office/reports${view ? `?view=${encodeURIComponent(view)}` : ""}`);
}
