"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/hooks/auth.hooks";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth.validation";
import { getDefaultRouteForRole } from "@/stores/auth.store";

export function LoginFormCard() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues): Promise<void> {
    try {
      const result = await loginMutation.mutateAsync(values);
      router.replace(getDefaultRouteForRole(result.user.role));
    } catch {
      // Ditangani oleh state error & toast di useLoginMutation
    }
  }

  const errorMessage = loginMutation.error instanceof Error ? loginMutation.error.message : null;

  return (
    <div className="auth-login-stack flex w-full flex-col gap-3">
      <Card className="auth-login-card gap-0 rounded-none bg-transparent py-0 ring-0 sm:rounded-[22px] sm:bg-[#1e2023] sm:py-6 sm:ring-1 sm:ring-white/15 sm:shadow-2xl">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="auth-form-fields space-y-5 px-0 sm:px-8">
            {errorMessage && (
              <div
                role="alert"
                className="auth-error flex items-start gap-2.5 rounded-lg border border-red-300/30 bg-red-950/60 p-3 text-sm text-red-100"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="auth-form-field space-y-1.5">
              <Label htmlFor="identifier" className="text-sm font-medium text-neutral-200">
                Nomor HP atau Username
              </Label>
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                placeholder="081234567890 atau username"
                aria-invalid={Boolean(errors.identifier)}
                className="auth-form-control h-12 border-white/15 bg-[#17181a] px-3.5 text-base text-white placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:ring-neutral-300/30"
                {...register("identifier")}
              />
              {errors.identifier && <p className="text-sm font-medium text-red-300">{errors.identifier.message}</p>}
            </div>

            <div className="auth-form-field space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-200">
                Kata Sandi
              </Label>
              <div className="relative flex items-center">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan kata sandi"
                  aria-invalid={Boolean(errors.password)}
                  className="auth-form-control h-12 border-white/15 bg-[#17181a] px-3.5 pr-14 text-base text-white placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:ring-neutral-300/30"
                  {...register("password")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  className="auth-password-toggle absolute right-0.5 size-12 text-neutral-400 hover:bg-white/10 hover:text-white focus-visible:ring-white/30"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm font-medium text-red-300">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="auth-submit h-12 w-full rounded-lg bg-[#52575f] text-base font-medium tracking-wide text-white transition-colors duration-200 hover:bg-[#5e646d] focus-visible:border-neutral-300 focus-visible:ring-neutral-300/50 motion-reduce:transition-none"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Memeriksa akun...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
      <p className="auth-help text-center text-sm leading-relaxed text-neutral-400">
        Belum punya akun atau lupa kata sandi?
        <span className="block">Hubungi Owner atau Admin.</span>
      </p>
    </div>
  );
}
