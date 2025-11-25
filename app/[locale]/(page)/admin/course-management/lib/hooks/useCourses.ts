import { useState, useCallback } from 'react';
import { coursesApi } from '../api/coursesApi';
import type { Course, GetCoursesParams } from '../types/types';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchCourses = useCallback(async (params: GetCoursesParams = {}) => {
    setLoading(true);
    try {
      const response = await coursesApi.getCourses(params);
      if (response.success) {
        setCourses(response.data.courses);
        setTotalCount(response.data.pagination.totalCount);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    courses,
    loading,
    currentPage,
    totalCount,
    totalPages,
    fetchCourses,
    setCurrentPage,
  };
};
