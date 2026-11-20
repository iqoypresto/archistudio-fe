import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

export interface WorkspaceTab {
  id: string;
  label: string;
  description: string;
}

export function WorkspaceTabSlot({
  title,
  tabs,
  activeTab,
}: {
  title: string;
  tabs: WorkspaceTab[];
  activeTab?: string;
}) {
  const active = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader title={title} description={active.description} />
      <nav aria-label={`${title} kategori`} className="flex flex-wrap gap-2 border-b border-border">
        {tabs.map((tab) => {
          const isActive = tab.id === active.id;
          return (
            <Link
              key={tab.id}
              href={`?tab=${tab.id}`}
              aria-current={isActive ? "page" : undefined}
              className={`inline-flex min-h-11 items-center border-b-2 px-4 text-sm font-medium transition-colors motion-reduce:transition-none ${isActive ? "border-primary text-text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <section className="rounded-xl border border-border bg-surface p-6 text-sm text-text-secondary">
        Belum ada data untuk ditampilkan.
      </section>
    </div>
  );
}
