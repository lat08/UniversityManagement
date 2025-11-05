import { api } from '@/lib/api';
import type { ScheduleChangeRequest, ScheduleChangeResponse, MakeupSlotSuggestionsRequest, MakeupSlotSuggestionsResponse } from '../types/scheduleChange.types';

export const createScheduleChange = async (data: ScheduleChangeRequest): Promise<ScheduleChangeResponse> => {
  const response = await api.post<ScheduleChangeResponse>('/v1/instructor-schedule/schedule-change', data);
  return response.data;
};

export const getMakeupSlotSuggestions = async (data: MakeupSlotSuggestionsRequest): Promise<MakeupSlotSuggestionsResponse> => {
  const response = await api.post<MakeupSlotSuggestionsResponse>('/v1/instructor-schedule/makeup-slot-suggestions', data);
  return response.data;
};

