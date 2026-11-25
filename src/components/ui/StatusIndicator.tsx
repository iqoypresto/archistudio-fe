import type { ReactNode } from "react";
import type { StatusTone } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

const DOT_TONE_MAP: Record<StatusTone, string> = {
  success: "bg-status-success-fg",
  warning: "bg-status-warning-fg",
  danger: "bg-status-danger-fg",
  info: "bg-status-info-fg",
  muted: "bg-status-muted-fg",
};

const TEXT_TONE_MAP: Record<StatusTone, string> = {
  success: "text-text-primary",
  warning: "text-status-warning-fg",
  danger: "text-status-danger-fg",
  info: "text-text-secondary",
  muted: "text-text-muted",
};

interface StatusIndicatorProps {
  tone: StatusTone;
  children: ReactNode;
  accentText?: boolean;
  className?: string;
}

export function StatusIndicator({
  tone,
  children,
  accentText = true,
  className,
}: StatusIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[13px] font-medium leading-none",
        accentText ? TEXT_TONE_MAP[tone] : "text-text-primary",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", DOT_TONE_MAP[tone])}
      />
      <span>{children}</span>
    </span>
  );
}
