import { useState, useEffect, useCallback } from 'react';
import { documentsApi } from '../api/documentsApi';
import { CourseGroup } from '../types/types';

interface UseDocumentsReturn {
  courseGroups: CourseGroup[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDocuments = (): UseDocumentsReturn => {
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await documentsApi.getDocuments();
      
      if (response.success) {
        setCourseGroups(response.data);
      } else {
        setError('Không thể tải dữ liệu tài liệu');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    courseGroups,
    loading,
    error,
    refetch: fetchDocuments
  };
};


