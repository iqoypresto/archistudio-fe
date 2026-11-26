import type { ReactNode } from "react";

export function FieldMainPageTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-12 items-center pr-14">
      <h1 className="font-heading text-[1.75rem] font-bold leading-[1.2] tracking-tight">
        {children}
      </h1>
    </div>
  );
}
