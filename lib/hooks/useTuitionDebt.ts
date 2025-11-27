import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { tuitionApi } from '@/lib/api/tuition';
import { queryKeys } from '@/lib/api/queryKeys';
import type {
  TuitionDebtFilter,
  StudentDebtByCode,
} from '@/lib/types';

export const useTuitionDebts = (filter: TuitionDebtFilter) => {
  return useQuery({
    queryKey: queryKeys.tuition.debtList(filter),
    queryFn: () => tuitionApi.getTuitionDebts(filter),
    staleTime: 30000, // 30 seconds - data changes infrequently
    gcTime: 300000, // 5 minutes - keep in cache longer
    // Allow fetching without semesterId (all semesters) - removed enabled check
    refetchOnWindowFocus: false, // Don't refetch on window focus for better UX
  });
};

export const useStudentDebtDetail = (
  studentCode: string | null,
): UseQueryResult<StudentDebtByCode | null, Error> => {
  return useQuery<StudentDebtByCode, Error, StudentDebtByCode | null>({
    queryKey: queryKeys.tuition.debtDetail(studentCode ?? ''),
    queryFn: () => tuitionApi.getStudentDebtByCode(studentCode!),
    enabled: !!studentCode,
    staleTime: 60000, // 1 minute - detail changes less frequently
    gcTime: 600000, // 10 minutes - keep in cache longer
    refetchOnWindowFocus: false,
    select: (data) => data ?? null,
  });
};