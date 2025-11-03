import { useState, useEffect } from 'react';
import { documentsApi } from '../api/documentsApi';
import { Subject } from '../types/types';
import { AxiosError } from 'axios';

interface UseSubjectsReturn {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage subjects data
 * @returns Subjects data, loading state, error state, and refetch function
 */
export const useSubjects = (): UseSubjectsReturn => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[useSubjects] 🔍 Fetching subjects...');
      const response = await documentsApi.getSubjects();
      
      console.log('[useSubjects] 📦 Response:', response);
      
      if (response.success && response.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        console.log('[useSubjects] ✅ Setting subjects:', data);
        setSubjects(data);
      } else {
        console.warn('[useSubjects] ⚠️ Response not successful:', response);
        setError('Không thể tải dữ liệu môn học');
        setSubjects([]);
      }
    } catch (err) {
      console.error('[useSubjects] Error:', err);
      const axiosErr = err as AxiosError<{ message?: string }>;
      const errorMessage = 
        axiosErr.response?.data?.message ||
        axiosErr.message ||
        'Đã xảy ra lỗi khi tải danh sách môn học.';
      setError(errorMessage);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    loading,
    error,
    refetch: fetchSubjects,
  };
};

