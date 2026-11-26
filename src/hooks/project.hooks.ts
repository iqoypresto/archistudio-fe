import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { projectApi } from "@/lib/api/project.api";
import type { ApiSurface } from "@/lib/api/api-surface";
import type {
  ArchiveFilterParams,
  CreateProjectPayload,
  ProjectFilterParams,
  ProjectListItem,
  RestoreProjectPayload,
  UpdateProjectPayload,
} from "@/types/api/project.types";

export const PROJECTS_QUERY_KEY = ["projects"] as const;
export const ARCHIVED_PROJECTS_QUERY_KEY = ["projects", "archive"] as const;

export function useProjectsQuery(params: ProjectFilterParams, options?: {
  enabled?: boolean;
  staleTime?: number;
  keepPreviousData?: boolean;
  surface?: ApiSurface;
}) {
  const surface = options?.surface ?? "office";
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, surface, params],
    queryFn: () => projectApi.getProjects(params, surface),
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime,
    placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
  });
}

export function useArchivedProjectsQuery(
  params?: ArchiveFilterParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: [...ARCHIVED_PROJECTS_QUERY_KEY, "office", params ?? {}],
    queryFn: () => projectApi.getArchivedProjects(params),
    enabled: options?.enabled ?? true,
  });
}

export function useProjectDetailQuery(id: string, surface: ApiSurface = "office") {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, surface, "detail", id],
    queryFn: () => projectApi.getProjectById(id, surface),
    enabled: Boolean(id),
  });
}

export function useCreateProjectMutation(
  onSuccessCallback?: (created: ProjectListItem) => void,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectApi.createProject(payload),
    onSuccess: (created) => {
      toast.success("Project baru berhasil dibuat.");
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      onSuccessCallback?.(created);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal membuat project.");
    },
  });
}

export function useUpdateProjectMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProjectPayload }) =>
      projectApi.updateProject(id, payload),
    onSuccess: () => {
      toast.success("Data project berhasil diperbarui.");
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui data project.");
    },
  });
}

export function useCompleteProjectMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectApi.completeProject(id),
    onSuccess: () => {
      toast.success("Project ditandai selesai dan dimasukkan ke Archive.");
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menandai project selesai.");
    },
  });
}

export function useArchiveProjectMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectApi.archiveProject(id),
    onSuccess: () => {
      toast.success("Project berhasil diarsipkan ke halaman Archive.");
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengarsipkan project.");
    },
  });
}

export function useRestoreProjectMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RestoreProjectPayload }) =>
      projectApi.restoreProject(id, payload),
    onSuccess: () => {
      toast.success("Project berhasil dipulihkan ke daftar aktif.");
      queryClient.invalidateQueries({ queryKey: PROJECTS_QUERY_KEY });
      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memulihkan project.");
    },
  });
}
