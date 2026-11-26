"use client";

import { SupervisorMainMenu } from "@/components/layout/SupervisorMainMenu";
import { Badge } from "@/components/ui/badge";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("id-ID") ?? "")
    .join("");
}

function getGreeting(date: Date): string {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Jakarta",
  }).format(date));
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export function SupervisorHomeHero({ name }: { name: string }) {
  const date = new Date();

  return (
    <section
      aria-label="Selamat datang"
      className="relative isolate min-h-44 overflow-hidden bg-[var(--project-hero-mid)]"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,var(--project-hero-start)_0%,var(--project-hero-mid)_54%,var(--project-hero-end)_100%)]" />
      <div className="relative z-10 px-6 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)] text-white">
        <div className="flex min-h-12 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Badge aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full border border-white/25 bg-white/15 p-0 text-sm font-bold text-white">
              {getInitials(name)}
            </Badge>
            <div className="min-w-0">
              <p className="text-sm leading-5 text-white/90">{getGreeting(date)},</p>
              <h1 className="truncate text-base font-bold leading-6 tracking-tight">{name}</h1>
            </div>
          </div>
          <SupervisorMainMenu />
        </div>
      </div>
    </section>
  );
}
