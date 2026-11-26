import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrencyIdr } from "@/lib/validation/payment.validation";
import type { DashboardSystemOverview } from "@/types/api/dashboard.types";

interface DashboardSystemOverviewPanelProps {
  overview: DashboardSystemOverview;
}

export function DashboardSystemOverviewPanel({ overview }: DashboardSystemOverviewPanelProps) {
  const { projects, team, recentActivity, payments } = overview;
  const totalArchived = projects.completed + projects.archivedManual;
  const hasAttention =
    projects.withoutSiteManager > 0 ||
    team.unassignedAreasCount > 0 ||
    team.areasWithInactiveSupervisorCount > 0 ||
    (payments ? payments.overdueUnpaidCount > 0 : false);

  return (
    <div className="border-t border-border p-4 sm:p-5 tabular-nums">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-canvas/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Portofolio Proyek
            </h3>
            <Link
              href="/office/projects"
              className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Kelola Proyek <ArrowRight className="size-3" />
            </Link>
          </div>
          <dl className="mt-3 divide-y divide-border/60 text-xs">
            <div className="flex items-center justify-between py-2">
              <dt className="text-text-secondary">Berjalan (Operasional)</dt>
              <dd className="font-semibold text-status-success-fg">{projects.running} proyek</dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-text-secondary">Persiapan</dt>
              <dd className="font-semibold text-text-primary">{projects.preparing} proyek</dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-text-secondary">Selesai &amp; Arsip Manual</dt>
              <dd className="font-semibold text-text-primary">
                <Link href="/office/archive" className="underline-offset-4 hover:underline">
                  {totalArchived} proyek ({projects.completed} selesai · {projects.archivedManual} manual)
                </Link>
              </dd>
            </div>
            <div className="flex items-center justify-between pt-2">
              <dt className="text-text-secondary">Proyek Aktif Tanpa Site Manager</dt>
              <dd
                className={`font-semibold ${
                  projects.withoutSiteManager > 0 ? "text-status-warning-fg" : "text-text-muted"
                }`}
              >
                {projects.withoutSiteManager} proyek
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-canvas/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Tim Internal &amp; Kesehatan Penugasan
            </h3>
            <Link
              href="/office/members"
              className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Anggota Tim <ArrowRight className="size-3" />
            </Link>
          </div>
          <dl className="mt-3 divide-y divide-border/60 text-xs">
            <div className="flex items-center justify-between py-2">
              <dt className="text-text-secondary">Akun Aktif / Nonaktif</dt>
              <dd className="font-semibold text-text-primary">
                {team.totalActive} aktif · {team.inactiveCount} nonaktif
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-text-secondary">Komposisi Peran Aktif</dt>
              <dd className="text-right font-medium text-text-secondary">
                {team.ownerCount} Owner · {team.adminCount} Admin · {team.siteManagerCount} SM ·{" "}
                {team.supervisorCount} SPV
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-text-secondary">Area Proyek Berjalan Belum Di-plot</dt>
              <dd
                className={`font-semibold ${
                  team.unassignedAreasCount > 0 ? "text-status-warning-fg" : "text-text-muted"
                }`}
              >
                {team.unassignedAreasCount} area
              </dd>
            </div>
            <div className="flex items-center justify-between pt-2">
              <dt className="text-text-secondary">Area dengan Pengawas Nonaktif</dt>
              <dd
                className={`font-semibold ${
                  team.areasWithInactiveSupervisorCount > 0
                    ? "text-status-danger-fg"
                    : "text-text-muted"
                }`}
              >
                {team.areasWithInactiveSupervisorCount} area
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-canvas/40 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
              Aktivitas Proyek ({recentActivity.days} Hari Terakhir)
            </h3>
            <span className="text-[11px] text-text-muted">Seluruh proyek</span>
          </div>
          <dl className="mt-3 divide-y divide-border/60 text-xs">
            <div className="flex items-center justify-between py-2">
              <dt className="text-text-secondary">Catatan Comms In</dt>
              <dd className="font-semibold text-text-primary">{recentActivity.commsInCount} catatan</dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-text-secondary">Catatan Comms Out</dt>
              <dd className="font-semibold text-text-primary">{recentActivity.commsOutCount} catatan</dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-text-secondary">Drawing Diunggah</dt>
              <dd className="font-semibold text-text-primary">{recentActivity.drawingsCount} gambar</dd>
            </div>
            {recentActivity.documentsCount !== null && (
              <div className="flex items-center justify-between pt-2">
                <dt className="text-text-secondary">Document Out (Quotation/BAST/Invoice)</dt>
                <dd className="font-semibold text-text-primary">{recentActivity.documentsCount} file</dd>
              </div>
            )}
          </dl>
        </section>

        {payments && (
          <section className="rounded-xl border border-border bg-canvas/40 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                Pembayaran HR Belum Dibayar
              </h3>
              <div className="flex items-center gap-3">
                <Link
                  href="/office/hr/freelance/payment"
                  className="text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  Freelance
                </Link>
                <Link
                  href="/office/hr/agent/payment"
                  className="text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
                >
                  Agent
                </Link>
              </div>
            </div>
            <dl className="mt-3 divide-y divide-border/60 text-xs">
              <div className="flex items-center justify-between py-2">
                <dt className="text-text-secondary">Total Nominal Menunggu</dt>
                <dd
                  className={`font-semibold ${
                    payments.totalUnpaidAmount > 0 ? "text-status-warning-fg" : "text-text-primary"
                  }`}
                >
                  {formatCurrencyIdr(payments.totalUnpaidAmount)}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-text-secondary">Jumlah Tagihan Belum Lunas</dt>
                <dd className="font-semibold text-text-primary">{payments.unpaidCount} tagihan</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-text-secondary">Melewati Jatuh Tempo</dt>
                <dd
                  className={`font-semibold ${
                    payments.overdueUnpaidCount > 0 ? "text-status-danger-fg" : "text-text-muted"
                  }`}
                >
                  {payments.overdueUnpaidCount} tagihan
                </dd>
              </div>
              <div className="flex items-center justify-between pt-2">
                <dt className="text-text-secondary">Rincian Kategori</dt>
                <dd className="font-medium text-text-secondary">
                  {payments.freelanceUnpaidCount} Freelance · {payments.agentUnpaidCount} Agent
                </dd>
              </div>
            </dl>
          </section>
        )}
      </div>

      {!hasAttention && (
        <p className="mt-3 text-xs text-text-muted">
          Tidak ada temuan konfigurasi proyek, penugasan pengawas, atau tagihan jatuh tempo yang perlu segera ditangani.
        </p>
      )}
    </div>
  );
}
