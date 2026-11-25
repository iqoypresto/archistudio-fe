import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalContextStripProps {
  kicker?: ReactNode;
  title: ReactNode;
  meta?: ReactNode;
  className?: string;
}

export function ModalContextStrip({
  kicker,
  title,
  meta,
  className,
}: ModalContextStripProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface-input/70 px-3.5 py-2.5 tabular-nums",
        className,
      )}
    >
      {kicker && <p className="text-[11px] font-medium text-text-muted">{kicker}</p>}
      <p className="mt-0.5 text-sm font-semibold text-text-primary">{title}</p>
      {meta && <p className="mt-0.5 text-xs text-text-secondary">{meta}</p>}
    </div>
  );
}

interface ModalNoteBoxProps {
  children: ReactNode;
  tone?: "neutral" | "danger";
  className?: string;
}

export function ModalNoteBox({
  children,
  tone = "neutral",
  className,
}: ModalNoteBoxProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3.5 py-2.5 text-xs leading-relaxed",
        tone === "danger"
          ? "border-status-danger-fg/20 bg-status-danger-bg text-status-danger-fg"
          : "border-border bg-canvas/70 text-text-secondary",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface ModalMetricStripProps {
  items: Array<{
    label: string;
    value: ReactNode;
    accent?: "default" | "danger" | "warning";
  }>;
  className?: string;
}

export function ModalMetricStrip({ items, className }: ModalMetricStripProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-x divide-border rounded-lg border border-border bg-canvas/70 tabular-nums",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="px-3.5 py-2.5">
          <p className="text-[11px] text-text-muted">{item.label}</p>
          <p
            className={cn(
              "mt-0.5 text-sm font-semibold",
              item.accent === "danger"
                ? "text-status-danger-fg"
                : item.accent === "warning"
                  ? "text-status-warning-fg"
                  : "text-text-primary",
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
