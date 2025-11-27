import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import { examScheduleApi } from '../api/examScheduleApi';
import { transformExamData, sortExamsByStatus } from '../utils/examUtils';

export const useExamSchedule = (semesterId: string | null) => {
  return useQuery({
    queryKey: queryKeys.examSchedule.bySemester(semesterId ?? ''),
    queryFn: async () => {
      if (!semesterId) return [];
      const data = await examScheduleApi.getSchedule(semesterId);
      return sortExamsByStatus(transformExamData(data));
    },
    enabled: !!semesterId,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};
