export interface SupervisorAreaTaskStatus {
  areaId: string;
  areaCode: string;
  areaName: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  projectLocation: string;
  timezone: string;
  routineHolidays: number[];
  assignmentStartDate: string;
  assignmentEndDate: string | null;
  pendingDates: string[];
  overdueDates: string[];
  nextRequiredDate: string | null;
  todayDate: string;
  isTodayLocked: boolean;
  isTodayRestDay: boolean;
  isTodaySubmitted: boolean;
  overdueBusinessDaysCount: number;
  isOverdueMoreThan3Days: boolean;
  oldestOverdueDate: string | null;
}
