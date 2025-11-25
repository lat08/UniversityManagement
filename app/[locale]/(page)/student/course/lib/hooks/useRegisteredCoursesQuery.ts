import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { coursesApi } from '../api/coursesApi';
import { queryKeys } from '@/lib/api/queryKeys';

interface UseRegisteredCoursesQueryOptions {
  pageNumber?: number;
  pageSize?: number;
}

export const useRegisteredCoursesQuery = (options: UseRegisteredCoursesQueryOptions = {}) => {
  const t = useTranslations('student.course');
  const { pageNumber = 1, pageSize = 10 } = options;

  const query = useQuery({
    queryKey: queryKeys.studentCourses.registered(),
    queryFn: async () => {
      const data = await coursesApi.getRegistered();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 3 * 60 * 1000, // 3 phút
    gcTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Client-side pagination
  const safeCoursesArray = useMemo(() => Array.isArray(query.data) ? query.data : [], [query.data]);
  const totalCount = safeCoursesArray.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePageNumber = Math.min(Math.max(1, pageNumber), totalPages);
  const startIdx = (safePageNumber - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedCourses = useMemo(() => 
    safeCoursesArray.slice(startIdx, endIdx), 
    [safeCoursesArray, startIdx, endIdx]
  );

  return {
    courses: safeCoursesArray,
    paginatedCourses,
    pagination: {
      totalCount,
      pageNumber: safePageNumber,
      pageSize,
      totalPages,
      hasPrevious: safePageNumber > 1,
      hasNext: safePageNumber < totalPages,
    },
    isLoading: query.isPending,
    error: query.error?.message ?? (query.data ? null : t('loadRegisteredError')),
    refetch: query.refetch,
  };
};



