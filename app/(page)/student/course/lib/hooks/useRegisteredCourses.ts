// Path: lib/hooks/useRegisteredCourses.ts
import { useEffect, useState, useCallback } from "react";
import { coursesApi } from "../api/coursesApi";
import { CourseDto } from "../type/courseType";

export const useRegisteredCourses = () => {
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coursesApi.getRegistered();
      setCourses(data);
    } catch (err: unknown) {
      setError("Không thể tải danh sách khóa học đã đăng ký");
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