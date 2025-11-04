// Path: lib/hooks/useAvailableCourses.ts
import { useEffect, useState, useCallback } from "react";
import { coursesApi } from "../api/coursesApi";
import { CourseDto } from "../type/courseType";

export const useAvailableCourses = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coursesApi.getAvailable();
      setCourses(data);
    } catch (err: unknown) {
      console.error("Error fetching available courses:", err);
      setError("Không thể tải danh sách khóa học có sẵn");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, error, refetch: fetchCourses };
};