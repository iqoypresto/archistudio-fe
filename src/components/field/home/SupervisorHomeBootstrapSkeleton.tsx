import { Skeleton } from "@/components/ui/skeleton";
import { FIELD_BOTTOM_TABS } from "@/components/layout/field-bottom-nav.config";

export function SupervisorHomeBootstrapSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="supervisor-mobile project-mobile-shell relative isolate mx-auto flex min-h-dvh w-full max-w-md flex-col bg-canvas shadow-xs"
    >
      <main className="flex-1 bg-[var(--project-canvas)] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        <HomeHeaderSkeleton />
        <div className="relative z-10 -mt-17 min-h-[70dvh] rounded-t-[2rem] bg-[var(--project-canvas)] px-4 pb-8 pt-6">
          <div className="space-y-6">
            <Placeholder className="h-56 w-full rounded-[1.125rem] bg-[var(--project-skeleton)]" />
            <WeeklyAnalysisSkeleton />
            <RecentReportsSkeleton />
          </div>
        </div>
      </main>
      <HomeBottomNavigationSkeleton />
    </div>
  );
}

function HomeHeaderSkeleton() {
  return (
    <header className="relative isolate min-h-44 overflow-hidden bg-[var(--project-hero-mid)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,var(--project-hero-start)_0%,var(--project-hero-mid)_54%,var(--project-hero-end)_100%)]"
      />
      <Placeholder className="absolute right-4 top-[calc(env(safe-area-inset-top)+1.25rem)] size-12 rounded-full bg-white/15" />
      <div className="relative z-10 px-6 pb-8 pt-[calc(env(safe-area-inset-top)+1.25rem)] text-white">
        <div className="space-y-1.5 pr-14">
          <div className="flex min-h-12 items-center gap-3">
            <Placeholder className="size-12 shrink-0 rounded-full border border-white/25 bg-white/15" />
            <div className="min-w-0 space-y-1.5">
              <Placeholder className="h-3.5 w-24 bg-white/15" />
              <Placeholder className="h-5 w-36 bg-white/15" />
            </div>
          </div>
          <Placeholder className="h-4 w-44 bg-white/15" />
        </div>
      </div>
    </header>
  );
}

function WeeklyAnalysisSkeleton() {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <Placeholder className="h-6 w-40 bg-[var(--project-skeleton)]" />
        <Placeholder className="h-3 w-28 bg-[var(--project-skeleton)]" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Placeholder className="h-20 rounded-2xl bg-[var(--project-skeleton)]" />
        <Placeholder className="h-20 rounded-2xl bg-[var(--project-skeleton)]" />
        <Placeholder className="h-20 rounded-2xl bg-[var(--project-skeleton)]" />
      </div>
    </section>
  );
}

function RecentReportsSkeleton() {
  return (
    <section className="space-y-3">
      <div className="flex min-h-12 items-center justify-between">
        <Placeholder className="h-6 w-40 bg-[var(--project-skeleton)]" />
      </div>
      <div className="space-y-2">
        <Placeholder className="h-20 w-full rounded-2xl bg-[var(--project-skeleton)]" />
        <Placeholder className="h-20 w-full rounded-2xl bg-[var(--project-skeleton)]" />
      </div>
    </section>
  );
}

function HomeBottomNavigationSkeleton() {
  return (
    <div className="field-bottom-navigation fixed bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] left-1/2 z-30 grid min-h-[5.125rem] w-[calc(100%-2rem)] max-w-[26.5rem] -translate-x-1/2 grid-cols-4 gap-1 rounded-[1.875rem] border p-2 shadow-[var(--field-nav-shadow)]">
      {FIELD_BOTTOM_TABS.map((tab) => (
        <div key={tab.href} className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-[1.4375rem]">
          <Placeholder className="size-[1.375rem] rounded-full bg-[var(--project-skeleton)]" />
          <Placeholder className="h-2.5 w-9 rounded-sm bg-[var(--project-skeleton)]" />
        </div>
      ))}
    </div>
  );
}

function Placeholder({ className }: { className: string }) {
  return <Skeleton className={`motion-reduce:animate-none ${className}`} />;
}
