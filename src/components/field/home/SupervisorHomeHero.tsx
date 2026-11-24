"use client";

import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const HERO_IMAGE = "/brand/supervisor-home-hero.webp";

export function SupervisorHomeHero({ name }: { name: string }) {
  return (
    <section
      aria-label="Selamat datang"
      className="relative isolate h-[22dvh] min-h-[calc(env(safe-area-inset-top)+10rem)] max-h-56 overflow-hidden"
    >
      <AspectRatio ratio={16 / 9} className="absolute inset-x-0 top-0">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            sizes="(max-width: 448px) 100vw, 448px"
            quality={80}
            preload
            draggable={false}
            className="object-cover object-center"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/25 to-black/70"
        />
      </AspectRatio>
      <div className="absolute inset-x-6 bottom-8 z-10 text-white">
        <h1 className="truncate text-[clamp(1.5rem,4dvh,2rem)] font-bold leading-tight tracking-tight">
          Halo, {name}
        </h1>
        <p className="mt-2 flex items-center gap-2 text-base font-medium text-white/95">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-emerald-400" />
          Supervisor Proyek
        </p>
      </div>
    </section>
  );
}
