import type { ReactNode } from "react";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";
import { LoginSplashLayer } from "@/components/auth/LoginSplashLayer";
import { AuthCardShell } from "@/components/layout/AuthCardShell";

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <AuthBootstrap scope="guest">
      <LoginSplashLayer>
        <AuthCardShell>{children}</AuthCardShell>
      </LoginSplashLayer>
    </AuthBootstrap>
  );
}
