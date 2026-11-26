"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CircleHelp, LogOut, Menu, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useLogoutMutation } from "@/hooks/auth.hooks";
import { getRoleLabel } from "@/lib/utils/role";
import { useAuthStore } from "@/stores/auth.store";

type MenuView = "menu" | "profile" | "help";

const viewTitle: Record<MenuView, string> = {
  menu: "Menu",
  profile: "Profil",
  help: "Bantuan",
};

export function SupervisorMainMenu({ tone = "hero" }: { tone?: "hero" | "surface" }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogoutMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<MenuView>("menu");

  async function handleLogout(): Promise<void> {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      router.replace("/login");
    }
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setView("menu");
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label="Buka menu Supervisor"
        onClick={() => setIsOpen(true)}
        className={`size-12 rounded-full ${tone === "hero" ? "text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/70" : "text-[var(--project-action)] hover:bg-[var(--project-nav-hover)] hover:text-[var(--project-action)]"}`}
      >
        <Menu className="size-6" aria-hidden="true" />
      </Button>
      <SheetContent
        side="right"
        overlayClassName="bg-black/55 backdrop-blur-none supports-backdrop-filter:backdrop-blur-none"
        closeButtonLabel="Tutup menu"
        className="supervisor-main-menu-panel h-full overflow-y-auto rounded-l-[1.5rem] border-l border-[var(--project-border)] !bg-white px-4 pb-5 pt-[calc(env(safe-area-inset-top)+1rem)] text-[var(--project-text-heading)] shadow-2xl"
      >
        <SheetHeader className="flex-row items-center gap-3 px-0 py-2 pr-10">
          {view !== "menu" && (
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label="Kembali ke menu"
              onClick={() => setView("menu")}
              className="size-12 shrink-0 rounded-full text-[var(--project-text-secondary)]"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Button>
          )}
          <div>
            <SheetTitle className="text-xl font-bold text-[var(--project-text-heading)]">
              {viewTitle[view]}
            </SheetTitle>
            <SheetDescription className="text-sm text-[var(--project-text-secondary)]">
              {view === "menu" ? "Pengaturan akun dan bantuan" : "ArchiStudio Lapangan"}
            </SheetDescription>
          </div>
        </SheetHeader>

        {view === "menu" && (
          <nav aria-label="Menu Supervisor" className="grid gap-2">
            <MenuItem icon={UserRound} label="Profil" onClick={() => setView("profile")} />
            <MenuItem icon={CircleHelp} label="Bantuan" onClick={() => setView("help")} />
            <MenuItem
              icon={LogOut}
              label={logoutMutation.isPending ? "Keluar…" : "Keluar"}
              onClick={() => void handleLogout()}
              disabled={logoutMutation.isPending}
              destructive
            />
          </nav>
        )}

        {view === "profile" && (
          <dl className="grid gap-4 rounded-[1.125rem] border border-[var(--project-border)] bg-[var(--project-canvas)] p-4">
            <ProfileField label="Nama" value={user?.name || "Belum tersedia"} />
            <ProfileField label="Jabatan" value={user?.jobTitle || getRoleLabel(user?.role)} />
            {user?.username && <ProfileField label="Username" value={user.username} />}
            {user?.phone && <ProfileField label="Nomor telepon" value={user.phone} />}
          </dl>
        )}

        {view === "help" && (
          <p className="rounded-[1.125rem] border border-[var(--project-border)] bg-[var(--project-canvas)] p-4 text-base leading-6 text-[var(--project-text-body)]">
            Jika mengalami kendala saat membuka project atau mengirim laporan, periksa koneksi internet lalu coba lagi. Jika kendala berlanjut, hubungi admin kantor.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  destructive = false,
}: {
  icon: typeof UserRound;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-14 w-full justify-start gap-3 rounded-xl px-4 text-base font-semibold ${destructive ? "text-[#a72c35] hover:bg-[#fce8e9] hover:text-[#a72c35] focus-visible:ring-[#a72c35]/30" : "text-[var(--project-text-heading)] hover:bg-[var(--project-nav-hover)]"}`}
    >
      <Icon className="size-5" aria-hidden="true" />
      {label}
    </Button>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-sm font-medium text-[var(--project-text-secondary)]">{label}</dt>
      <dd className="break-words text-base font-semibold text-[var(--project-text-heading)]">{value}</dd>
    </div>
  );
}
