// Path: lib/hooks/useRegisteredCourses.ts
import { useEffect, useState, useCallback, useMemo } from "react";
import { coursesApi } from "../api/coursesApi";
import { CourseDto } from "../type/courseType";

export const useRegisteredCourses = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coursesApi.getRegistered();
      setCourses(data);
    } catch (err: unknown) {
      console.error("Error fetching registered courses:", err);
      setError("Không thể tải danh sách khóa học đã đăng ký");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Derived pagination data computed client-side
  const totalCount = courses.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePageNumber = Math.min(Math.max(1, pageNumber), totalPages);
  const startIdx = (safePageNumber - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const paginatedCourses = useMemo(() => courses.slice(startIdx, endIdx), [courses, startIdx, endIdx]);

  const goToPage = useCallback((page: number) => {
    const next = Math.min(Math.max(1, page), totalPages);
    setPageNumber(next);
  }, [totalPages]);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPageNumber(1); // reset to first page when page size changes
  }, []);

  return { 
    courses, 
    loading, 
    error, 
    refetch: fetchCourses,
    paginatedCourses,
    pagination: {
      totalCount,
      pageNumber: safePageNumber,
      pageSize,
      totalPages,
      hasPrevious: safePageNumber > 1,
      hasNext: safePageNumber < totalPages,
    },
    goToPage,
    changePageSize,
  };
};