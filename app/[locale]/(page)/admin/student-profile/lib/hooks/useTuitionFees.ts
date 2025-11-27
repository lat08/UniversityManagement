import { useState, useCallback } from 'react';
import { studentsApi } from '../api/studentsApi';
import { TuitionFee } from '../types/types';

export function useTuitionFees(studentId: string) {
  const [tuitionFees, setTuitionFees] = useState<TuitionFee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTuitionFees = useCallback(async (semesterId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.getTuitionFees({
        studentId,
        semesterId,
      });
      
      if (response.success && response.data) {
        setTuitionFees(response.data);
      } else {
        setTuitionFees(null);
      }
    } catch (err) {
      setError('Không thể tải thông tin học phí');
      setTuitionFees(null);
      console.error('Error fetching tuition fees:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  return { tuitionFees, loading, error, fetchTuitionFees };
}


