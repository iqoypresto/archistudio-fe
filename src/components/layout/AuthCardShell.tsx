import type { ReactNode } from "react";
import Image from "next/image";

export function AuthCardShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-viewport flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[#161719] px-6 text-white sm:px-4">
      <div className="auth-viewport__content flex w-full max-w-[440px] flex-col items-center">
        <header className="auth-viewport__brand flex flex-col items-center text-center">
          <Image
            src="/brand/archistudio-logo.webp"
            alt=""
            width={56}
            height={56}
            priority
            className="auth-viewport__logo mb-3 size-14 object-contain"
          />
          <h1 className="auth-viewport__wordmark font-heading text-2xl font-normal leading-tight tracking-[0.18em]  sm:text-[26px]">
            {/* Shine dinonaktifkan sementara sesuai permintaan client.
            <ShinyText direction="right">a r c h i s t u d i o</ShinyText>
            */}
            <span className="font-bold text-white">a r c h i s t u d i o</span>
          </h1>
          <p className="auth-viewport__caption mt-1 text-[11px] font-normal tracking-[0.25em] text-neutral-400  sm:text-xs">
            architecture studio & construction
          </p>
        </header>

        {children}
      </div>
    </div>
  );
}
