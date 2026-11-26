"use client";

export function formatReportDate(value: string): string {
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

export function ReportContextCard({ projectName, areaName, reportDate }: {
  projectName: string;
  areaName: string;
  reportDate: string;
}) {
  return (
    <section aria-label="Informasi laporan" className="overflow-hidden rounded-xl border border-[var(--project-border)] bg-[var(--project-surface)] shadow-[var(--project-card-shadow)]">
      <table className="w-full table-fixed border-collapse text-[13px] leading-[1.125rem]">
        <caption className="sr-only">Informasi laporan baru</caption>
        <tbody>
          <InfoRow label="Proyek" value={projectName} prominent />
          <InfoRow label="Area" value={areaName} />
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
      <th scope="row" className="w-20 px-3 py-2 text-left align-top text-[13px] font-medium text-[var(--project-text-secondary)]">
        {label}
      </th>
      <td className={`break-words px-3 py-2 align-top ${prominent ? "font-bold text-[var(--project-text-heading)]" : "font-medium text-[var(--project-text-body)]"}`}>
        {value}
      </td>
    </tr>
  );
}
