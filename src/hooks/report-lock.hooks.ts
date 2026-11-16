import { useQuery } from "@tanstack/react-query";
import { reportLockApi } from "@/lib/api/report-lock.api";

export const MY_AREAS_STATUS_QUERY_KEY = ["reports", "my-areas-status"] as const;

export function useMyAreasStatusQuery() {
  return useQuery({
    queryKey: MY_AREAS_STATUS_QUERY_KEY,
    queryFn: () => reportLockApi.getMyAreasStatus(),
  });
}
