"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { WorkspaceNavGroup, WorkspaceNavItem } from "./workspace-nav.config";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface WorkspaceBreadcrumbsProps {
  groups: WorkspaceNavGroup[];
  projectTitle?: string;
  projectHref?: string;
  className?: string;
}

export function WorkspaceBreadcrumbs({
  groups,
  projectTitle,
  projectHref,
  className,
}: WorkspaceBreadcrumbsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = findActiveItem(groups, pathname, searchParams.toString());
  const items = getBreadcrumbItems(pathname, active, projectTitle, projectHref);

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex min-w-0 items-center gap-1.5 text-xs text-text-muted">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
              {index > 0 && <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />}
              {item.href && !isCurrent ? (
                <Link href={item.href} className="truncate transition-colors hover:text-text-primary">{item.label}</Link>
              ) : (
                <span aria-current={isCurrent ? "page" : undefined} className="truncate text-text-secondary">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function findActiveItem(groups: WorkspaceNavGroup[], pathname: string, query: string): { group: string; item: WorkspaceNavItem } | undefined {
  for (const group of groups) {
    const item = group.items.find((entry) => matchesHref(entry.href, entry.exact, pathname, query));
    if (item) return { group: group.label, item };
    for (const entry of group.items) {
      const child = entry.children?.find((candidate) => matchesHref(candidate.href, candidate.exact, pathname, query));
      if (child) return { group: group.label, item: child };
    }
  }
  return undefined;
}

function matchesHref(href: string | undefined, exact: boolean | undefined, pathname: string, query: string): boolean {
  if (!href) return false;
  const [hrefPath, hrefQuery] = href.split("?");
  const pathMatches = exact
    ? pathname === hrefPath
    : pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  return pathMatches && (!hrefQuery || hrefQuery === query);
}

function getBreadcrumbItems(
  pathname: string,
  active: ReturnType<typeof findActiveItem>,
  projectTitle?: string,
  projectHref?: string,
): BreadcrumbItem[] {
  if (projectHref) {
    return [
      { label: "Semua Project", href: "/projects" },
      { label: projectTitle ?? "Project", href: projectHref },
      { label: active?.item.label ?? "Overview & Area" },
    ];
  }
  if (pathname === "/projects") return [{ label: "Project" }, { label: "Semua Project" }];
  if (active?.item.href === "/dashboard") return [{ label: active.item.label }];
  if (active) return [{ label: "Dashboard", href: "/dashboard" }, { label: active.item.label }];
  return [{ label: "Workspace" }];
}
