"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FieldPageBackButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      onClick={() => router.back()}
      aria-label="Kembali"
      className="size-11 min-h-11 min-w-11 shrink-0 rounded-full text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/70"
    >
      <ArrowLeft className="size-5" aria-hidden="true" />
    </Button>
  );
}
