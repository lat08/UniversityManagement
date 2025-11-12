export interface ScheduleChangeRequest {
  courseClassId: string;
  cancelledWeek: number;
  makeupWeek?: number;
  makeupDate?: string;
  makeupRoomId?: string;
  dayOfWeek: number;
  startPeriod: number;
  endPeriod: number;
  reason: string;
}

export interface ScheduleChangeResponse {
  success: boolean;
  message: string;
  data: {
    scheduleChangeId: string;
    courseClassId: string;
    subjectName: string;
    subjectCode: string;
    cancelledWeek: number;
    cancelledDate: string | null;
    cancelledDateText: string | null;
    cancelledRoomCode: string | null;
    cancelledRoomName: string | null;
    cancelledDayOfWeek: number | null;
    cancelledDayOfWeekText: string | null;
    cancelledStartPeriod: number | null;
    cancelledEndPeriod: number | null;
    makeupWeek: number | null;
    makeupDate: string | null;
    makeupRoomCode: string | null;
    makeupRoomName: string | null;
    dayOfWeek: number;
    dayOfWeekText: string;
    startPeriod: number;
    endPeriod: number;
    reason: string;
    createdAt: string;
  };
}

export interface MakeupSlotSuggestion {
  roomId: string;
  roomCode: string;
  roomName: string;
  buildingId: string;
  buildingName: string;
  capacity: number;
  roomType: string;
  dayOfWeek: number;
  dayOfWeekText: string;
  date: string;
  startPeriod: number;
  endPeriod: number;
  slotLabel: string;
  isPreferredRoomType: boolean;
}

export interface OccupiedSlot {
  sourceId: string;
  sourceType: string;
  sourceName: string;
  roomId: string;
  roomCode: string;
  roomName: string;
  buildingName: string;
  dayOfWeek: number;
  dayOfWeekText: string;
  date: string;
  startPeriod: number;
  endPeriod: number;
  conflictReason: string;
}

export interface MakeupSlotSuggestionsRequest {
  courseClassId: string;
  cancelledWeek: number;
  makeupWeek: number;
  makeupDate?: string;
  preferredRoomType?: string;
  preferredBuildingId?: string;
}

export interface MakeupSlotSuggestionsResponse {
  success: boolean;
  message: string;
  data: {
    courseClassId: string;
    semesterId: string;
    makeupWeek: number;
    weekStartDate: string;
    weekEndDate: string;
    sessionDuration: number;
    requiredCapacity: number;
    suggestions: MakeupSlotSuggestion[];
    occupiedSlots: OccupiedSlot[];
  };
}

export interface AdminScheduleChangeRequestDto {
  scheduleChangeRequestId: string;
  courseClassId: string;
  subjectName: string;
  subjectCode: string;
  instructorName: string;
  cancelledWeek: number;
  cancelledDate: string | null;
  cancelledDateText: string | null;
  cancelledRoomCode: string | null;
  cancelledRoomName: string | null;
  cancelledDayOfWeek: number | null;
  cancelledDayOfWeekText: string | null;
  cancelledStartPeriod: number | null;
  cancelledEndPeriod: number | null;
  makeupWeek: number | null;
  makeupDate: string | null;
  makeupRoomCode: string | null;
  makeupRoomName: string | null;
  dayOfWeek: number;
  dayOfWeekText: string;
  startPeriod: number;
  endPeriod: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface ScheduleChangeHistoryDto {
  scheduleChangeId: string;
  courseClassId: string;
  subjectName: string;
  subjectCode: string;
  cancelledWeek: number;
  cancelledDate: string | null;
  cancelledDateText: string | null;
  cancelledRoomCode: string | null;
  cancelledRoomName: string | null;
  cancelledDayOfWeek: number | null;
  cancelledDayOfWeekText: string | null;
  cancelledStartPeriod: number | null;
  cancelledEndPeriod: number | null;
  makeupWeek: number | null;
  makeupDate: string | null;
  makeupRoomCode: string | null;
  makeupRoomName: string | null;
  dayOfWeek: number;
  dayOfWeekText: string;
  startPeriod: number;
  endPeriod: number;
  reason: string;
  createdAt: string;
  reportFileUrl: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

