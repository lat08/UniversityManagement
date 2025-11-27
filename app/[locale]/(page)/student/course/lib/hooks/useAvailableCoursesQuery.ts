import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { coursesApi, GetAvailableCoursesParams } from '../api/coursesApi';
import { CourseDto } from '../type/courseType';
import { queryKeys } from '@/lib/api/queryKeys';
import { useCourseFiltersStore } from '../stores/courseFiltersStore';

interface UseAvailableCoursesQueryOptions {
  searchQuery?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const useAvailableCoursesQuery = (options: UseAvailableCoursesQueryOptions = {}) => {
  const t = useTranslations('student.course');
  const queryClient = useQueryClient();
  const filters = useCourseFiltersStore((state) => state.filters);
  const { searchQuery = '', pageNumber = 1, pageSize = 15 } = options;

  // Check if any client-side filter is active
  const hasClientFilters = filters.availableOnly !== null || 
                          filters.isGeneral !== null || 
                          filters.isInStudentCurriculum !== null;

  // Build params - use large page size if client-side filters are active
  const params: GetAvailableCoursesParams = useMemo(() => ({
    pageNumber: 1,
    pageSize: hasClientFilters ? 1000 : pageSize,
    searchQuery: searchQuery || undefined,
    // Không gửi các filter client-side lên server
    availableOnly: undefined,
    isGeneral: undefined,
    isInStudentCurriculum: undefined,
  }), [searchQuery, hasClientFilters, pageSize]);

  const query = useQuery({
    queryKey: queryKeys.studentCourses.availableList(params),
    queryFn: async () => {
      const response = await coursesApi.getAvailable(params);
      return response;
    },
    staleTime: 3 * 60 * 1000, // 3 phút
    gcTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Client-side filtering
  const filteredCourses = useMemo(() => {
    if (!query.data?.items) return [];
    
    return query.data.items.filter((course: CourseDto) => {
      // Filter 1: availableOnly
      if (filters.availableOnly !== null) {
        if (filters.availableOnly && !course.isAvailableForThisStudent) {
          return false;
        }
        if (!filters.availableOnly && course.isAvailableForThisStudent) {
          return false;
        }
      }

      // Filter 2: isGeneral
      if (filters.isGeneral !== null && course.isGeneral !== filters.isGeneral) {
        return false;
      }

      // Filter 3: isInStudentCurriculum
      if (filters.isInStudentCurriculum !== null && 
          course.isInStudentCurriculum !== filters.isInStudentCurriculum) {
        return false;
      }

      return true;
    });
  }, [query.data?.items, filters.availableOnly, filters.isGeneral, filters.isInStudentCurriculum]);

  // Client-side pagination
  const clientPageSize = 15;
  const totalFiltered = filteredCourses.length;
  const totalPages = Math.ceil(totalFiltered / clientPageSize) || 1;
  const startIndex = (pageNumber - 1) * clientPageSize;
  const endIndex = startIndex + clientPageSize;
  const paginatedCourses = useMemo(() => {
    return filteredCourses.slice(startIndex, endIndex);
  }, [filteredCourses, startIndex, endIndex]);

  // Prefetch next page if available
  if (query.data && pageNumber < totalPages) {
    const nextPageParams = { ...params, pageNumber: pageNumber + 1 };
    void queryClient.prefetchQuery({
      queryKey: queryKeys.studentCourses.availableList(nextPageParams),
      queryFn: async () => {
        const response = await coursesApi.getAvailable(nextPageParams);
        return response;
      },
      staleTime: 3 * 60 * 1000,
    });
  }

  return {
    courses: paginatedCourses,
    allCourses: filteredCourses,
    pagination: {
      totalCount: totalFiltered,
      pageNumber,
      pageSize: clientPageSize,
      totalPages,
      hasPrevious: pageNumber > 1,
      hasNext: pageNumber < totalPages,
    },
    isLoading: query.isPending,
    error: query.error?.message ?? (query.data ? null : t('loadAvailableError')),
    refetch: query.refetch,
  };
};








