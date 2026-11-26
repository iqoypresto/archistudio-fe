import type { UserRole } from "./auth.types";

export interface SupervisorSummary {
  id: string;
  name: string;
  username: string;
  phone: string;
  jobTitle: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface ActiveAssignmentInfo {
  id: string;
  supervisorId: string;
  startDate: string;
  endDate: string | null;
  supervisor: SupervisorSummary;
}

export interface AreaListItem {
  id: string;
  projectId: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  activeAssignment?: ActiveAssignmentInfo | null;
}

export interface AssignmentHistoryItem {
  id: string;
  areaId: string;
  supervisorId: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  supervisor: SupervisorSummary;
  assignedBy: {
    id: string;
    name: string;
  };
}

export interface CreateAreaPayload {
  code: string;
  name: string;
  initialSupervisorId: string;
  startDate: string;
}

export interface UpdateAreaPayload {
  code?: string;
  name?: string;
}

export interface AssignSupervisorPayload {
  supervisorId: string;
  effectiveStartDate: string;
}
