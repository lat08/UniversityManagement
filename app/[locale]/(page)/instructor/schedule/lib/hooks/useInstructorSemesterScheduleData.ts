import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import type { InstructorSemesterScheduleItem } from '../types/semesterTypes';

interface UseInstructorSemesterScheduleDataProps {
  semesterId: number | null;
  subjectId?: number | null;
}

interface UseInstructorSemesterScheduleDataReturn {
  scheduleData: InstructorSemesterScheduleItem[];
  isLoading: boolean;
  error: string | null;
}

export function useInstructorSemesterScheduleData({
  semesterId,
  subjectId
}: UseInstructorSemesterScheduleDataProps): UseInstructorSemesterScheduleDataReturn {
  const semesterIdStr = semesterId?.toString() ?? '';
  const subjectIdStr = subjectId?.toString() ?? '';

  const {
    data: response,
    isLoading,
    error: queryError
  } = useQuery({
    queryKey: subjectId
      ? queryKeys.schedule.instructor.semesterBySubject(semesterIdStr, subjectIdStr)
      : queryKeys.schedule.instructor.semester(semesterIdStr),
    queryFn: async () => {
      const { instructorSemesterScheduleApi } = await import('../api/semesterScheduleApi');
      return subjectId
        ? instructorSemesterScheduleApi.getScheduleBySubject(semesterIdStr, subjectIdStr)
        : instructorSemesterScheduleApi.getInstructorSchedule(semesterIdStr);
    },
    enabled: Boolean(semesterId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1
  });

  const scheduleData = response?.data ?? [];
  const error = queryError instanceof Error ? queryError.message : null;

  return { scheduleData, isLoading, error };
}
