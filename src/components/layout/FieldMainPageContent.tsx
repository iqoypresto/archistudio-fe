import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FieldMainPageContent({
  children,
  overlap = "standard",
}: {
  children: ReactNode;
  overlap?: "standard" | "raised";
}) {
  return (
    <div className={cn(
      "relative z-10 min-h-[70dvh] rounded-t-[2rem] bg-[var(--project-canvas)] px-4 pb-8 pt-6 [&_button]:min-h-12",
      overlap === "raised" ? "-mt-20" : "-mt-17",
    )}>
      {children}
    </div>
  );
}
