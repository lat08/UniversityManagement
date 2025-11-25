import { useState, useCallback } from 'react';
import { studentsApi } from '../api/studentsApi';
import { SemesterGrades } from '../types/types';

export const useGrades = (studentId: string) => {
  const [grades, setGrades] = useState<SemesterGrades | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = useCallback(async (semesterId: string) => {
    if (!semesterId) {
      setGrades(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.getSemesterGrades({ studentId, semesterId });
      if (response.success) {
        setGrades(response.data);
      } else {
        setError(response.message || 'Không thể tải dữ liệu điểm');
        setGrades(null);
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError('Đã xảy ra lỗi khi tải dữ liệu điểm');
      setGrades(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  return {
    grades,
    loading,
    error,
    fetchGrades,
  };
};

