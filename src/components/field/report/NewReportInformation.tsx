"use client";

import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyAreasStatusQuery } from "@/hooks/report-lock.hooks";

function formatReportDate(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function NewReportInformation() {
  const searchParams = useSearchParams();
  const areaId = searchParams.get("areaId") ?? "";
  const reportDate = searchParams.get("date") ?? "";
  const areasQuery = useMyAreasStatusQuery();

  if (!areaId || !reportDate) return null;

  if (areasQuery.isLoading) {
    return (
      <section aria-label="Informasi laporan" className="overflow-hidden rounded-2xl border border-[var(--project-border)] bg-[var(--project-surface)]">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-4 border-b border-[var(--project-border)] px-4 py-3 last:border-b-0">
            <Skeleton className="h-4 w-20 shrink-0" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </section>
    );
  }

  const area = areasQuery.data?.find((item) => item.areaId === areaId);
  if (!area) return null;

  return (
    <section aria-label="Informasi laporan" className="overflow-hidden rounded-2xl border border-[var(--project-border)] bg-[var(--project-surface)] shadow-[var(--project-card-shadow)]">
      <table className="w-full table-fixed border-collapse text-sm leading-5">
        <caption className="sr-only">Informasi laporan baru</caption>
        <tbody>
          <InfoRow label="Proyek" value={area.projectName} prominent />
          <InfoRow label="Area" value={[area.areaCode, area.areaName].filter(Boolean).join(" · ")} />
          <InfoRow label="Lokasi" value={area.projectLocation || "—"} />
          <InfoRow label="Tanggal" value={formatReportDate(reportDate)} />
        </tbody>
      </table>
    </section>
  );
}

function InfoRow({ label, value, prominent = false }: {
  label: string;
  value: string;
  prominent?: boolean;
}) {
  return (
    <tr className="border-b border-[var(--project-border)] last:border-b-0">
      <th scope="row" className="w-24 px-4 py-3 text-left align-top text-sm font-medium text-[var(--project-text-secondary)]">
        {label}
      </th>
      <td className={`break-words px-4 py-3 align-top ${prominent ? "font-bold text-[var(--project-text-heading)]" : "font-medium text-[var(--project-text-body)]"}`}>
        {value}
      </td>
    </tr>
  );
}
