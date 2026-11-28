import { PageHeader } from "@/components/ui/PageHeader";
import { PageInfoDialog } from "@/components/ui/PageInfoDialog";

export function WorkspaceRouteSlot({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        title={title}
        titleSuffix={
          description ? (
            <PageInfoDialog title={`Tentang ${title}`} description={description} />
          ) : undefined
        }
      />
      <section className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary">
        Belum ada data untuk ditampilkan.
      </section>
    </div>
  );
}
