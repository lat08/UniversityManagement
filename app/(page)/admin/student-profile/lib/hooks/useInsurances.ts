import { useState, useCallback } from 'react';
import { studentsApi } from '../api/studentsApi';
import { Insurance } from '../types/types';

export function useInsurances(studentId: string) {
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsurances = useCallback(async (semesterId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentsApi.getInsurances({
        studentId,
        semesterId,
      });
      
      if (response.success) {
        setInsurances(Array.isArray(response.data) ? response.data : []);
      } else {
        setInsurances([]);
      }
    } catch (err) {
      setError('Không thể tải thông tin bảo hiểm');
      setInsurances([]);
      console.error('Error fetching insurances:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  return { insurances, loading, error, fetchInsurances };
}




