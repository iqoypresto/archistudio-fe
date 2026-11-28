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
  hideRightSlotOnMobile?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function UnderlineTabsBar<T extends string>({
  items,
  activeValue,
  onChange,
  rightSlot,
  hideRightSlotOnMobile = false,
  ariaLabel,
  className,
}: UnderlineTabsBarProps<T>) {
  const isLinkNav = items.some((item) => Boolean(item.href));

  const tabNodes = items.map((item) => {
    const active = item.value === activeValue;
    const classes = cn(
      "relative inline-flex min-h-11 shrink-0 items-center gap-1.5 border-b-2 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:min-h-0 sm:py-3",
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
        role="tab"
        aria-selected={active}
        onClick={() => onChange?.(item.value)}
        className={classes}
      >
        {content}
      </button>
    );
  });

  return (
    <div
      className={cn(
        "flex flex-col border-b border-border px-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3 sm:px-5",
        className,
      )}
    >
      <div className="relative min-w-0 max-w-full">
        {isLinkNav ? (
          <nav
            aria-label={ariaLabel}
            className="sidebar-scrollable -mb-px flex items-center gap-5 overflow-x-auto pr-6 sm:pr-0"
          >
            {tabNodes}
          </nav>
        ) : (
          <div
            role="tablist"
            aria-label={ariaLabel}
            className="sidebar-scrollable -mb-px flex items-center gap-5 overflow-x-auto pr-6 sm:pr-0"
          >
            {tabNodes}
          </div>
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-7 bg-linear-to-l from-surface to-transparent sm:hidden"
        />
      </div>
      {rightSlot && (
        <div
          className={cn(
            "border-t border-border/60 py-2 text-xs text-text-muted tabular-nums sm:border-t-0",
            hideRightSlotOnMobile && "hidden sm:block",
          )}
        >
          {rightSlot}
        </div>
      )}
    </div>
  );
}
