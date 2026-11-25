"use client";

import Image from "next/image";

const HERO_IMAGE = "/brand/supervisor-home-building-monoline.png";

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

function formatHomeDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function SupervisorHomeHero({ name }: { name: string }) {
  const date = new Date();

  return (
    <section
      aria-label="Selamat datang"
      className="relative isolate h-[34svh] min-h-64 max-h-80 overflow-hidden rounded-b-[2rem] bg-[#644735]"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#51392f] via-[#805943] to-[#ad8061]" />
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-[calc(env(safe-area-inset-top)+1.5rem)] h-[68%] w-[68%] opacity-95">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          sizes="(max-width: 448px) 72vw, 320px"
          quality={85}
          preload
          draggable={false}
          className="object-contain object-right"
        />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#51392f]/65 via-[#51392f]/20 to-transparent" />
      <div className="absolute inset-x-5 top-[calc(env(safe-area-inset-top)+1.5rem)] z-10 max-w-[72%] text-white sm:inset-x-6">
        <h1 className="text-[clamp(1.5rem,4dvh,2rem)] font-bold leading-tight tracking-tight">
          {getGreeting(date)}, {name}
        </h1>
        <p className="mt-2 text-base font-medium capitalize text-white/95">
          {formatHomeDate(date)}
        </p>
      </div>
    </section>
  );
}
