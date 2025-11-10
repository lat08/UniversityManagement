// Path: lib/hooks/useAvailableCourses.ts
import { useEffect, useState, useCallback } from "react";
import { coursesApi } from "../api/coursesApi";
import { CourseDto, PaginatedResponse } from "../type/courseType";
import { useCourseFiltersStore } from "../stores/courseFiltersStore";

export const useAvailableCourses = () => {
  const filters = useCourseFiltersStore((state) => state.filters);
  const [data, setData] = useState<PaginatedResponse<CourseDto>>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    pageSize: 15,
    totalPages: 0,
    hasPrevious: false,
    hasNext: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (
    page: number, 
    size: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await coursesApi.getAvailable({ 
        pageNumber: page, 
        pageSize: size,
        searchQuery: filters.searchQuery || undefined,
        availableOnly: filters.availableOnly,
        isGeneral: filters.isGeneral,
        isInStudentCurriculum: filters.isInStudentCurriculum,
      });
      setData(response);
    } catch (err: unknown) {
      console.error("Error fetching available courses:", err);
      setError("Không thể tải danh sách khóa học có sẵn");
      setData({
        items: [],
        totalCount: 0,
        pageNumber: page,
        pageSize: size,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCourses(1, 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= data.totalPages) {
      fetchCourses(page, data.pageSize);
    }
  }, [data.totalPages, data.pageSize, fetchCourses]);

  const changePageSize = useCallback((size: number) => {
    fetchCourses(1, size);
  }, [fetchCourses]);

  const refetch = useCallback(() => {
    fetchCourses(data.pageNumber, data.pageSize);
  }, [data.pageNumber, data.pageSize, fetchCourses]);

  return { 
    courses: data.items,
    pagination: {
      totalCount: data.totalCount,
      pageNumber: data.pageNumber,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
      hasPrevious: data.hasPrevious,
      hasNext: data.hasNext,
    },
    loading, 
    error, 
    refetch,
    goToPage,
    changePageSize,
  };
};