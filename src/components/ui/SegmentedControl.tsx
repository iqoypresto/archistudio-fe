"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  fullWidth = false,
  disabled = false,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface-input p-0.5",
        fullWidth && "grid w-full",
        className,
      )}
      style={
        fullWidth
          ? { gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }
          : undefined
      }
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium whitespace-nowrap transition-colors tabular-nums",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
              active
                ? "bg-primary text-text-primary shadow-2xs ring-1 ring-white/10"
                : "text-text-secondary hover:text-text-primary",
            )}
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span className={cn("text-[11px]", active ? "text-text-secondary" : "text-text-muted")}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
