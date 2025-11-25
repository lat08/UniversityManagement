import { useState, useEffect } from 'react';
import { studentsApi } from '../api/studentsApi';
import { CumulativeGradesData } from '../types/types';

export const useCumulativeGrades = (studentId: string | null) => {
  const [cumulativeData, setCumulativeData] = useState<CumulativeGradesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!studentId) {
      setCumulativeData(null);
      return;
    }

    const fetchCumulativeGrades = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await studentsApi.getCumulativeGrades(studentId);
        
        if (response.success) {
          setCumulativeData(response.data);
        } else {
          setError(response.message || 'Không thể tải dữ liệu điểm');
          setCumulativeData(null);
        }
      } catch (err) {
        console.error('Error fetching cumulative grades:', err);
        setError('Đã xảy ra lỗi khi tải dữ liệu điểm');
        setCumulativeData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCumulativeGrades();
  }, [studentId]);

  return {
    cumulativeData,
    loading,
    error,
  };
};
