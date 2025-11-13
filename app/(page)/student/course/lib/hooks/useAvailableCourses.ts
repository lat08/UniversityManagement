// Path: lib/hooks/useAvailableCourses.ts
import { useEffect, useState, useCallback, useMemo } from "react";
import { coursesApi } from "../api/coursesApi";
import { CourseDto } from "../type/courseType";
import { useCourseFiltersStore } from "../stores/courseFiltersStore";

export const useAvailableCourses = () => {
  const filters = useCourseFiltersStore((state) => state.filters);
  const [allCourses, setAllCourses] = useState<CourseDto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if any client-side filter is active
  const hasClientFilters = filters.availableOnly !== null || 
                          filters.isGeneral !== null || 
                          filters.isInStudentCurriculum !== null;

  // Fetch data - use large page size if client-side filters are active
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pageSize = hasClientFilters ? 1000 : 15; // Fetch more data when filtering client-side
      const response = await coursesApi.getAvailable({ 
        pageNumber: 1, 
        pageSize: pageSize,
        searchQuery: filters.searchQuery || undefined,
        // Không gửi các filter client-side lên server
        availableOnly: undefined,
        isGeneral: undefined,
        isInStudentCurriculum: undefined,
      });
      setAllCourses(Array.isArray(response.items) ? response.items : []);
      setCurrentPage(1);
      console.log('✅ useAvailableCourses - data set:', {
        itemsCount: Array.isArray(response.items) ? response.items.length : 0,
        totalCount: response.totalCount,
      });
    } catch (err: unknown) {
      console.error("Error fetching available courses:", err);
      setError("Không thể tải danh sách khóa học có sẵn");
      setAllCourses([]);
    } finally {
      setLoading(false);
    }
  }, [filters.searchQuery, hasClientFilters]);

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchQuery, hasClientFilters]);

  // Client-side filtering
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
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
  }, [allCourses, filters.availableOnly, filters.isGeneral, filters.isInStudentCurriculum]);

  // Client-side pagination
  const pageSize = 15;
  const totalFiltered = filteredCourses.length;
  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCourses = useMemo(() => {
    return filteredCourses.slice(startIndex, endIndex);
  }, [filteredCourses, startIndex, endIndex]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const changePageSize = useCallback(() => {
    setCurrentPage(1);
    // Note: pageSize is fixed at 15 for client-side pagination
  }, []);

  const refetch = useCallback(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.availableOnly, filters.isGeneral, filters.isInStudentCurriculum]);

  return { 
    courses: paginatedCourses,
    pagination: {
      totalCount: totalFiltered,
      pageNumber: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      hasPrevious: currentPage > 1,
      hasNext: currentPage < totalPages,
    },
    loading, 
    error, 
    refetch,
    goToPage,
    changePageSize,
  };
};