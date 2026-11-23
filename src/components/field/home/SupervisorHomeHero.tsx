import Image from "next/image";

export function SupervisorHomeHero({ name }: { name: string }) {
  return (
    <section
      aria-label="Selamat datang"
      className="relative isolate h-[min(68vw,330px)] min-h-[270px] overflow-hidden"
    >
      <Image
        src="/brand/supervisor-home-hero.webp"
        alt=""
        fill
        sizes="(max-width: 448px) 100vw, 448px"
        quality={80}
        preload
        className="object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/65"
      />
      <div className="relative flex h-full min-h-[270px] flex-col justify-end px-5 pb-11 pt-28 text-white">
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight">
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
