import { Skeleton } from "@/components/ui/skeleton";

export function OfficeRouteLoading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full max-w-7xl space-y-6">
      <span className="sr-only">Memuat halaman kantor...</span>
      <div className="space-y-2">
        <Skeleton className="h-8 w-56 motion-reduce:animate-none" />
        <Skeleton className="h-4 w-80 max-w-full motion-reduce:animate-none" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-32 motion-reduce:animate-none" />
        <Skeleton className="h-10 w-32 motion-reduce:animate-none" />
      </div>
      <Skeleton className="h-56 w-full rounded-xl motion-reduce:animate-none" />
    </div>
  );
}

export function FieldRouteLoading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full max-w-md space-y-5">
      <span className="sr-only">Memuat halaman lapangan...</span>
      <Skeleton className="h-8 w-48 motion-reduce:animate-none" />
      <Skeleton className="h-4 w-64 max-w-full motion-reduce:animate-none" />
      <Skeleton className="h-32 w-full rounded-xl motion-reduce:animate-none" />
      <Skeleton className="h-32 w-full rounded-xl motion-reduce:animate-none" />
    </div>
  );
}

export function ProjectRouteLoading() {
  return (
    <div role="status" aria-busy="true" className="mx-auto w-full max-w-7xl space-y-5">
      <span className="sr-only">Memuat project...</span>
      <Skeleton className="h-8 w-56 motion-reduce:animate-none" />
      <Skeleton className="h-4 w-80 max-w-full motion-reduce:animate-none" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-44 w-full rounded-xl motion-reduce:animate-none" />
        <Skeleton className="h-44 w-full rounded-xl motion-reduce:animate-none" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl motion-reduce:animate-none" />
    </div>
  );
}
