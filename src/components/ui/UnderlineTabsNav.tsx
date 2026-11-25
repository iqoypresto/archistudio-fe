"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface UnderlineTabItem<T extends string = string> {
  value: T;
  label: string;
  count?: number;
  href?: string;
}

interface UnderlineTabsBarProps<T extends string> {
  items: readonly UnderlineTabItem<T>[];
  activeValue: T;
  onChange?: (value: T) => void;
  rightSlot?: ReactNode;
  ariaLabel?: string;
  className?: string;
}

export function UnderlineTabsBar<T extends string>({
  items,
  activeValue,
  onChange,
  rightSlot,
  ariaLabel,
  className,
}: UnderlineTabsBarProps<T>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 sm:px-5",
        className,
      )}
    >
      <nav
        aria-label={ariaLabel}
        className="-mb-px flex items-center gap-5 overflow-x-auto"
      >
        {items.map((item) => {
          const active = item.value === activeValue;
          const classes = cn(
            "relative inline-flex items-center gap-1.5 border-b-2 py-3 text-[13px] font-medium whitespace-nowrap transition-colors tabular-nums",
            active
              ? "border-text-primary text-text-primary"
              : "border-transparent text-text-muted hover:text-text-primary",
          );
          const content = (
            <>
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className={cn("text-xs", active ? "text-text-secondary" : "text-text-muted")}>
                  ({item.count})
                </span>
              )}
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.value}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={classes}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange?.(item.value)}
              className={classes}
            >
              {content}
            </button>
          );
        })}
      </nav>
      {rightSlot && (
        <div className="py-2 text-xs text-text-muted tabular-nums">{rightSlot}</div>
      )}
    </div>
  );
}
