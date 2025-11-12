import { api } from '@/lib/api';
import type { 
  ScheduleChangeRequest, 
  ScheduleChangeResponse, 
  MakeupSlotSuggestionsRequest, 
  MakeupSlotSuggestionsResponse,
  AdminScheduleChangeRequestDto,
  ScheduleChangeHistoryDto,
  ApiResponse
} from '../types/scheduleChange.types';

export const createScheduleChange = async (data: ScheduleChangeRequest): Promise<ScheduleChangeResponse> => {
  try {
    const payload: Record<string, unknown> = {
      courseClassId: data.courseClassId,
      cancelledWeek: data.cancelledWeek,
      dayOfWeek: data.dayOfWeek,
      startPeriod: data.startPeriod,
      endPeriod: data.endPeriod,
      reason: data.reason,
    };

    if (data.makeupWeek !== undefined && data.makeupWeek !== null) {
      payload.makeupWeek = data.makeupWeek;
    }

    if (data.makeupDate) {
      payload.makeupDate = data.makeupDate;
    }

    if (data.makeupRoomId) {
      payload.makeupRoomId = data.makeupRoomId;
    }

    const response = await api.post<ScheduleChangeResponse>('/v1/instructor-schedule/schedule-change', payload);
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string }; status?: number } };
    if (apiError?.response?.data?.message) {
      throw new Error(apiError.response.data.message);
    }
    throw error;
  }
};

export const getMakeupSlotSuggestions = async (data: MakeupSlotSuggestionsRequest): Promise<MakeupSlotSuggestionsResponse> => {
  const payload: Record<string, unknown> = {
    courseClassId: data.courseClassId,
    cancelledWeek: data.cancelledWeek,
    makeupWeek: data.makeupWeek,
  };

  if (data.makeupDate) {
    payload.makeupDate = data.makeupDate;
  }

  if (data.preferredRoomType) {
    payload.preferredRoomType = data.preferredRoomType;
  }

  if (data.preferredBuildingId) {
    payload.preferredBuildingId = data.preferredBuildingId;
  }

  const response = await api.post<MakeupSlotSuggestionsResponse>('/v1/instructor-schedule/makeup-slot-suggestions', payload);
  return response.data;
};

export const getScheduleChangeRequests = async (status: string = 'all'): Promise<AdminScheduleChangeRequestDto[]> => {
  const params = new URLSearchParams();
  params.append('status', status);
  const response = await api.get<ApiResponse<AdminScheduleChangeRequestDto[]>>(
    `/v1/instructor-schedule/schedule-change-requests?${params.toString()}`
  );
  return response.data.data;
};

export const getScheduleChangesBySemester = async (semesterId: string): Promise<ScheduleChangeHistoryDto[]> => {
  const response = await api.get<ApiResponse<ScheduleChangeHistoryDto[]>>(
    `/v1/instructor-schedule/schedule-changes?semesterId=${semesterId}`
  );
  return response.data.data;
};

export const generateScheduleChangeReport = async (scheduleChangeId: string): Promise<string> => {
  const response = await api.post<ApiResponse<string>>(
    `/v1/instructor-schedule/schedule-changes/${scheduleChangeId}/generate-report`
  );
  return response.data.data;
};

export const checkScheduleChangeReportFile = async (scheduleChangeId: string): Promise<string | null> => {
  const response = await api.get<ApiResponse<string | null>>(
    `/v1/instructor-schedule/schedule-changes/${scheduleChangeId}/report-file`
  );
  return response.data.data;
};

export const deleteScheduleChangeRequest = async (requestId: string): Promise<boolean> => {
  await api.delete(`/v1/instructor-schedule/schedule-change-requests/${requestId}`);
  return true;
};

