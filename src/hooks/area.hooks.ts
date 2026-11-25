import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PROJECTS_QUERY_KEY } from "@/hooks/project.hooks";
import { areaApi } from "@/lib/api/area.api";
import type { ApiSurface } from "@/lib/api/api-surface";
import type {
  AssignSupervisorPayload,
  CreateAreaPayload,
  UpdateAreaPayload,
} from "@/types/api/area.types";

export const AREAS_QUERY_KEY = ["areas"] as const;

export function useProjectAreasQuery(projectId: string, surface: ApiSurface = "office") {
  return useQuery({
    queryKey: [...AREAS_QUERY_KEY, "project", surface, projectId],
    queryFn: () => areaApi.getAreasByProject(projectId, surface),
    enabled: Boolean(projectId),
  });
}

export function useAreaAssignmentsQuery(areaId: string | null) {
  return useQuery({
    queryKey: [...AREAS_QUERY_KEY, "assignments", areaId],
    queryFn: () => (areaId ? areaApi.getAssignmentHistory(areaId) : []),
    enabled: Boolean(areaId),
  });
}

export function useCreateAreaMutation(projectId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAreaPayload) => areaApi.createArea(projectId, payload),
    onSuccess: () => {
      toast.success("Area baru berhasil ditambahkan.");
      queryClient.invalidateQueries({ queryKey: [...AREAS_QUERY_KEY, "project"] });
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan area.");
    },
  });
}

export function useUpdateAreaMutation(projectId: string, onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ areaId, payload }: { areaId: string; payload: UpdateAreaPayload }) =>
      areaApi.updateArea(areaId, payload),
    onSuccess: () => {
      toast.success("Data area berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: [...AREAS_QUERY_KEY, "project"] });
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui data area.");
    },
  });
}

export function useAssignSupervisorMutation(
  projectId: string,
  onSuccessCallback?: () => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      areaId,
      payload,
    }: {
      areaId: string;
      payload: AssignSupervisorPayload;
    }) => areaApi.assignSupervisor(areaId, payload),
    onSuccess: () => {
      toast.success("Supervisor berhasil ditugaskan.");
      queryClient.invalidateQueries({ queryKey: [...AREAS_QUERY_KEY, "project"] });
      queryClient.invalidateQueries({ queryKey: [...AREAS_QUERY_KEY, "assignments"] });
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menugaskan supervisor.");
    },
  });
}
