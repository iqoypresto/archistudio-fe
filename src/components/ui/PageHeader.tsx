import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  kicker?: ReactNode;
  titleSuffix?: ReactNode;
  action?: ReactNode;
  className?: string;
  hideTitle?: boolean;
}

export function PageHeader({
  title,
  description,
  kicker,
  titleSuffix,
  action,
  className,
  hideTitle = false,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        {kicker && (
          <div className="text-xs font-medium text-text-muted tabular-nums">{kicker}</div>
        )}
        {!hideTitle && (
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-xl font-semibold tracking-tight text-text-primary sm:text-[22px]">
              {title}
            </h1>
            {titleSuffix}
          </div>
        )}
        {description && (
          <p className="text-xs leading-relaxed text-text-secondary sm:text-[13px]">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex flex-wrap shrink-0 items-center gap-2">{action}</div>
      )}
    </div>
  );
}
