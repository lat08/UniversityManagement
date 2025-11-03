import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';

export interface CourseClass {
  courseClassId: string;
  courseClassCode: string;
  courseClassName: string;
  subjectName: string;
  subjectCode: string;
  semesterName?: string;
}

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
      // TODO: Replace with actual API endpoint for instructor course classes
      // Example: const response = await api.get<CourseClassesResponse>('/v1/instructor/course-classes');
      
      // For now, we'll use a placeholder or get from exam entries
      // This is a temporary solution until we have the correct endpoint
      const response = await api.get<CourseClassesResponse>('/v1/instructor/course-classes');
      
      if (response.data.success && response.data.data) {
        setCourseClasses(response.data.data);
      } else {
        setError('Không thể tải danh sách lớp học phần');
        setCourseClasses([]);
      }
    } catch (_err: unknown) {
      // If endpoint doesn't exist, return empty array (can be populated from exam entries)
      console.warn('Course classes endpoint not available, using empty list');
      setCourseClasses([]);
      // Don't set error if endpoint doesn't exist
      return;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourseClasses();
  }, [fetchCourseClasses]);

  return { courseClasses, loading, error, refetch: fetchCourseClasses };
};

