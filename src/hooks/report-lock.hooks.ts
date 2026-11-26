import { useQuery } from "@tanstack/react-query";
import { reportLockApi } from "@/lib/api/report-lock.api";
import type { ListMyReportWorkItemsQuery } from "@/types/api/report-lock.types";

export const MY_AREAS_STATUS_QUERY_KEY = ["reports", "my-areas-status"] as const;
export const MY_REPORT_WORK_ITEMS_QUERY_KEY = ["reports", "my-work-items"] as const;

export function useMyAreasStatusQuery() {
  return useQuery({
    queryKey: MY_AREAS_STATUS_QUERY_KEY,
    queryFn: () => reportLockApi.getMyAreasStatus(),
  });
}

export function useMyReportWorkItemsQuery(query: ListMyReportWorkItemsQuery, enabled = true) {
  return useQuery({
    queryKey: [...MY_REPORT_WORK_ITEMS_QUERY_KEY, query],
    enabled,
    queryFn: () => reportLockApi.listMyReportWorkItems(query),
  });
}
