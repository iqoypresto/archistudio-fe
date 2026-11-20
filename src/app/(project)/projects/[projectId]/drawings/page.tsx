import { WorkspaceTabSlot } from "@/components/shared/WorkspaceTabSlot";

export default async function DrawingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <WorkspaceTabSlot title="Drawing" activeTab={tab} tabs={[
    { id: "masuk", label: "Masuk", description: "Gambar yang diterima untuk project." },
    { id: "keluar", label: "Keluar", description: "Gambar yang dikirim untuk project." },
  ]} />;
}
