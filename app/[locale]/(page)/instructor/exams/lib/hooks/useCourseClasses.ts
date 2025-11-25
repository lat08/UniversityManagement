import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { CourseClass } from '../types';

interface CourseClassesResponse {
  success: boolean;
  data: CourseClass[];
  message?: string;
}

/**
 * Hook to fetch course classes for instructor
 * This should use the appropriate API endpoint for instructor's course classes
 */
export const useCourseClasses = () => {
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<CourseClassesResponse>('/v1/instructor/course-classes');
      
      if (response.data.success && response.data.data) {
        setCourseClasses(response.data.data);
      } else {
        setError('Không thể tải danh sách lớp học phần');
        setCourseClasses([]);
      }
    } catch (err: unknown) {
      console.error('Error fetching course classes:', err);
      setError('Không thể tải danh sách lớp học phần');
      setCourseClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourseClasses();
  }, [fetchCourseClasses]);

  return { courseClasses, loading, error, refetch: fetchCourseClasses };
};

