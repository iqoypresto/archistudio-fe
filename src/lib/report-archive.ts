import type { ListArchivedReportsQuery } from "@/types/api/report.types";

export function patchArchiveFilters(previous: ListArchivedReportsQuery, patch: Partial<ListArchivedReportsQuery>) {
  return {
    ...previous, ...patch, page: 1,
    areaId: "projectId" in patch ? undefined : ("areaId" in patch ? patch.areaId : previous.areaId),
  };
}
