import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createScheduleChange, getMakeupSlotSuggestions, getScheduleChangeRequests, getScheduleChangesBySemester, generateScheduleChangeReport, checkScheduleChangeReportFile, deleteScheduleChangeRequest } from '../api/scheduleChangeApi';
import type { ScheduleChangeRequest, MakeupSlotSuggestionsRequest } from '../types/scheduleChange.types';

export const useCreateScheduleChange = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (data: ScheduleChangeRequest) => createScheduleChange(data), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['schedule-change-requests'] }); queryClient.invalidateQueries({ queryKey: ['schedule-changes-by-semester'] }); }, });
};

export const useMakeupSlotSuggestions = (data: MakeupSlotSuggestionsRequest | null, enabled: boolean = false) => {
  return useQuery({ queryKey: ['makeup-slot-suggestions', data], queryFn: () => { if (!data) throw new Error('Data is required'); return getMakeupSlotSuggestions(data); }, enabled: enabled && !!data, });
};

export const useScheduleChangeRequests = (status: string = 'all') => {
  return useQuery({ 
    queryKey: ['schedule-change-requests', status], 
    queryFn: () => getScheduleChangeRequests(status),
    enabled: true,
  });
};

export const useScheduleChangesBySemester = (semesterId: string | null) => {
  return useQuery({ queryKey: ['schedule-changes-by-semester', semesterId], queryFn: () => { if (!semesterId) throw new Error('Semester ID is required'); return getScheduleChangesBySemester(semesterId); }, enabled: !!semesterId, });
};

export const useGenerateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (scheduleChangeId: string) => generateScheduleChangeReport(scheduleChangeId), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['schedule-changes-by-semester'] }); queryClient.invalidateQueries({ queryKey: ['schedule-change-report'] }); }, });
};

export const useCheckReportFile = (scheduleChangeId: string | null) => {
  return useQuery({ queryKey: ['schedule-change-report', scheduleChangeId], queryFn: () => { if (!scheduleChangeId) throw new Error('Schedule Change ID is required'); return checkScheduleChangeReportFile(scheduleChangeId); }, enabled: !!scheduleChangeId, });
};

export const useDeleteScheduleChangeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (requestId: string) => deleteScheduleChangeRequest(requestId), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['schedule-change-requests'] }); queryClient.invalidateQueries({ queryKey: ['schedule-changes-by-semester'] }); }, });
};
