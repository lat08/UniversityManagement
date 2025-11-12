import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import type { InstructorWeeklyScheduleItem } from '../types/weeklyTypes';

interface UseInstructorScheduleDataProps {
  semesterId: number | null;
  weekNumber: number | null;
  subjectId?: number | null;
}

interface UseInstructorScheduleDataReturn {
  scheduleData: InstructorWeeklyScheduleItem[];
  isLoading: boolean;
  error: string | null;
  prefetchSchedule: (weekNumber: number) => Promise<void>;
}

export function useInstructorScheduleData({
  semesterId,
  weekNumber,
  subjectId
}: UseInstructorScheduleDataProps): UseInstructorScheduleDataReturn {
  const queryClient = useQueryClient();

  const semesterIdStr = semesterId?.toString() ?? '';
  const subjectIdStr = subjectId?.toString() ?? '';

  const {
    data: response,
    isLoading,
    error: queryError
  } = useQuery({
    queryKey: subjectId
      ? queryKeys.schedule.instructor.weeklyBySubject(semesterIdStr, weekNumber!, subjectIdStr)
      : queryKeys.schedule.instructor.weekly(semesterIdStr, weekNumber!),
    queryFn: async () => {
      const { instructorWeeklyScheduleApi } = await import('../api/weeklyScheduleApi');
      return subjectId
        ? instructorWeeklyScheduleApi.getWeeklyScheduleBySubject(semesterIdStr, weekNumber!, subjectIdStr)
        : instructorWeeklyScheduleApi.getWeeklySchedule(semesterIdStr, weekNumber!);
    },
    enabled: Boolean(semesterId && weekNumber),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1
  });

  const scheduleData = response?.data ?? [];

  const prefetchSchedule = async (targetWeek: number): Promise<void> => {
    if (!semesterId) return;

    await queryClient.prefetchQuery({
      queryKey: subjectId
        ? queryKeys.schedule.instructor.weeklyBySubject(semesterIdStr, targetWeek, subjectIdStr)
        : queryKeys.schedule.instructor.weekly(semesterIdStr, targetWeek),
      queryFn: async () => {
        const { instructorWeeklyScheduleApi } = await import('../api/weeklyScheduleApi');
        return subjectId
          ? instructorWeeklyScheduleApi.getWeeklyScheduleBySubject(semesterIdStr, targetWeek, subjectIdStr)
          : instructorWeeklyScheduleApi.getWeeklySchedule(semesterIdStr, targetWeek);
      },
      staleTime: 5 * 60 * 1000
    });
  };

  const error = queryError instanceof Error ? queryError.message : null;

  return { scheduleData, isLoading, error, prefetchSchedule };
}
