import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { projectApi } from "@/lib/api/project.api";
import { patchArchiveFilters } from "@/lib/report-archive";
import type { ProjectListItem } from "@/types/api/project.types";
import type { ListArchivedReportsQuery } from "@/types/api/report.types";

const INITIAL: ListArchivedReportsQuery = { page: 1, pageSize: 10, sortBy: "reportDate", sortOrder: "desc" };

export function useArchiveFilters() {
  const [filters, setFilters] = useState(INITIAL);
  return {
    filters,
    patch: (patch: Partial<ListArchivedReportsQuery>) => setFilters((previous) => patchArchiveFilters(previous, patch)),
    reset: () => setFilters(INITIAL),
    setPage: (page: number) => setFilters((previous) => ({ ...previous, page })),
    setPageSize: (pageSize: number) => setFilters((previous) => ({ ...previous, pageSize, page: 1 })),
  };
}

export function useArchiveProjectOptions() {
  return useQuery({
    queryKey: ["projects", "report-archive-options"],
    queryFn: async () => {
      const projects: ProjectListItem[] = [];
      let page = 1;
      let totalPages = 1;
      do {
        const result = await projectApi.getProjects({ page, pageSize: 100, sortBy: "name", sortOrder: "asc" });
        projects.push(...result.data);
        totalPages = result.meta.totalPages;
        page += 1;
      } while (page <= totalPages);
      const archived = await projectApi.getArchivedProjects();
      return [...new Map([...projects, ...archived].map((project) => [project.id, project])).values()];
    },
  });
}
