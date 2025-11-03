import { useState, useEffect } from 'react';
import { documentsApi } from '../api/documentsApi';
import { Semester } from '../types/types';
import { AxiosError } from 'axios';

interface UseSemestersReturn {
  semesters: Semester[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage semesters data
 * @returns Semesters data, loading state, error state, and refetch function
 */
export const useSemesters = (): UseSemestersReturn => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[useSemesters] 🔍 Fetching semesters...');
      const response = await documentsApi.getSemesters();
      
      console.log('[useSemesters] 📦 Response:', response);
      
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        console.log('[useSemesters] ✅ Setting semesters:', data);
        setSemesters(data);
      } else {
        console.warn('[useSemesters] ⚠️ Response not successful:', response);
        setError('Không thể tải dữ liệu học kỳ');
        setSemesters([]);
      }
    } catch (err) {
      console.error('[useSemesters] Error:', err);
      const axiosErr = err as AxiosError<{ message?: string }>;
      const errorMessage = 
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Đã xảy ra lỗi khi tải danh sách học kỳ.';
      setError(errorMessage);
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  return {
    semesters,
    loading,
    error,
    refetch: fetchSemesters,
  };
};

