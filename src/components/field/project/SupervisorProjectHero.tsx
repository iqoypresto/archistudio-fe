export function SupervisorProjectHero() {
  return (
    <header className="relative isolate min-h-44 overflow-hidden bg-[linear-gradient(180deg,var(--project-hero-start)_0%,var(--project-hero-mid)_54%,var(--project-hero-end)_100%)]">
      <div className="px-6 pb-6 pt-[calc(env(safe-area-inset-top)+3rem)] text-white">
        <h1 className="font-heading text-[1.75rem] font-bold leading-[1.2] tracking-tight">
          Project Saya
        </h1>
        <p className="text-base leading-6 text-white">
          Project yang ditugaskan kepada Anda
        </p>
      </div>
    </header>
  );
}
