import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  kicker?: ReactNode;
  titleSuffix?: ReactNode;
  action?: ReactNode;
  className?: string;
  hideTitle?: boolean;
}

export function PageHeader({
  title,
  kicker,
  titleSuffix,
  action,
  className,
  hideTitle = false,
}: PageHeaderProps) {
  const showHeadingBlock = Boolean(kicker) || !hideTitle;
  if (!showHeadingBlock && !action) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        !showHeadingBlock && "sm:justify-end",
        className,
      )}
    >
      {showHeadingBlock && (
        <div className="space-y-1">
          {kicker && (
            <div className="text-xs font-medium text-text-muted tabular-nums">{kicker}</div>
          )}
          {!hideTitle && (
            <div className="flex items-center gap-1.5">
              <h1 className="font-heading text-xl font-semibold tracking-tight text-text-primary sm:text-[22px]">
                {title}
              </h1>
              {titleSuffix}
            </div>
          )}
        </div>
      )}
      {action && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>
      )}
    </div>
  );
}
