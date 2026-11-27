import { Skeleton } from "@/components/ui/skeleton";
import { SupervisorHomeBootstrapSkeleton } from "@/components/field/home/SupervisorHomeBootstrapSkeleton";

export type AuthBootstrapScope = "guest" | "office" | "field" | "project" | "root";

export function AuthBootstrapFallback({ scope }: { scope: AuthBootstrapScope }) {
  return (
    <div role="status" aria-busy="true" className="auth-bootstrap-fallback min-h-dvh bg-canvas">
      <span className="sr-only">Menyiapkan aplikasi...</span>
      {scope === "office" && <OfficeBootstrapFallback />}
      {scope === "field" && <FieldBootstrapFallback />}
      {(scope === "project" || scope === "root" || scope === "guest") && (
        <RedirectBootstrapFallback />
      )}
    </div>
  );
}

function OfficeBootstrapFallback() {
  return (
    <div aria-hidden="true" className="flex min-h-dvh bg-canvas lg:gap-4 lg:p-4">
      <aside className="hidden w-64 shrink-0 flex-col gap-7 rounded-xl bg-sidebar p-4 lg:flex">
        <div className="flex items-center gap-3">
          <Placeholder className="size-9 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <Placeholder className="h-3 w-28 bg-white/10" />
            <Placeholder className="h-2.5 w-20 bg-white/10" />
          </div>
        </div>
        <div className="space-y-3">
          <Placeholder className="h-9 w-full bg-white/10" />
          <Placeholder className="h-9 w-full bg-white/10" />
          <Placeholder className="h-9 w-full bg-white/10" />
          <Placeholder className="h-9 w-full bg-white/10" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="px-4 pt-4 sm:px-6 lg:hidden">
          <Placeholder className="size-9" />
        </div>
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-6">
          <div className="space-y-2">
            <Placeholder className="h-8 w-56" />
            <Placeholder className="h-4 w-80 max-w-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Placeholder className="h-24 rounded-xl" />
            <Placeholder className="h-24 rounded-xl" />
            <Placeholder className="h-24 rounded-xl" />
            <Placeholder className="h-24 rounded-xl" />
          </div>
          <Placeholder className="h-56 rounded-xl" />
        </main>
      </div>
    </div>
  );
}

function FieldBootstrapFallback() {
  return <SupervisorHomeBootstrapSkeleton />;
}

function RedirectBootstrapFallback() {
  return (
    <div aria-hidden="true" className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col gap-5 p-4 pt-8 sm:p-6">
      <Placeholder className="h-8 w-52" />
      <Placeholder className="h-4 w-72 max-w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Placeholder className="h-40 rounded-xl" />
        <Placeholder className="h-40 rounded-xl" />
      </div>
    </div>
  );
}

function Placeholder({ className }: { className: string }) {
  return <Skeleton aria-hidden="true" className={`motion-reduce:animate-none ${className}`} />;
}
