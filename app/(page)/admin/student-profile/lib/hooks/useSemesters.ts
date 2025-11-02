import { useState, useEffect } from 'react';
import { studentsApi } from '../api/studentsApi';
import { Semester } from '../types/types';

export function useSemesters() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSemesters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await studentsApi.getSemesters();
        
        if (isMounted && response.success && Array.isArray(response.data)) {
          setSemesters(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Không thể tải danh sách học kỳ');
          console.error('Error fetching semesters:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSemesters();

    return () => {
      isMounted = false;
    };
  }, []);

  const getCurrentSemester = () => {
    const now = new Date();
    return semesters.find((semester) => {
      const startDate = new Date(semester.startDate);
      const endDate = new Date(semester.endDate);
      return now >= startDate && now <= endDate;
    });
  };

  return { semesters, loading, error, getCurrentSemester };
}



