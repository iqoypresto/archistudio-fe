import { WorkspaceTabSlot } from "@/components/shared/WorkspaceTabSlot";

export default async function ProjectDocumentsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <WorkspaceTabSlot title="Dokumen Keluar" activeTab={tab} tabs={[
    { id: "quotation", label: "Quotation", description: "Dokumen quotation project." },
    { id: "bast", label: "BAST", description: "Berita Acara Serah Terima project." },
    { id: "invoice", label: "Invoice", description: "Dokumen invoice project." },
  ]} />;
}
