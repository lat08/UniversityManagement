import { useMutation, useQuery } from '@tanstack/react-query';
import { createScheduleChange, getMakeupSlotSuggestions } from '../api/scheduleChangeApi';
import type { ScheduleChangeRequest, MakeupSlotSuggestionsRequest } from '../types/scheduleChange.types';

export const useCreateScheduleChange = () => {
  return useMutation({
    mutationFn: (data: ScheduleChangeRequest) => createScheduleChange(data),
  });
};

export const useMakeupSlotSuggestions = (
  data: MakeupSlotSuggestionsRequest | null,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: ['makeup-slot-suggestions', data],
    queryFn: () => {
      if (!data) throw new Error('Data is required');
      return getMakeupSlotSuggestions(data);
    },
    enabled: enabled && !!data,
  });
};

