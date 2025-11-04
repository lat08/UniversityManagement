import { useState, useEffect, useCallback } from 'react';
import { documentsApi } from '../api/documentsApi';
import { CourseGroup, GetMaterialsParams } from '../types/types';
import { AxiosError } from 'axios';

interface UseDocumentsReturn {
  courseGroups: CourseGroup[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Custom hook to fetch and manage documents data
 * @param params - Optional search and filter parameters
 * @returns Documents data, loading state, error state, and refetch function
 */
export const useDocuments = (params?: GetMaterialsParams): UseDocumentsReturn => {
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await documentsApi.getMaterials(params);
      
      if (response.success && response.data) {
        const items = response.data.items || [];
        setCourseGroups(items);
        setTotalCount(response.data.totalCount || 0);
        setPageNumber(response.data.pageNumber || 1);
        setPageSize(response.data.pageSize || 10);
        setTotalPages(response.data.totalPages || 0);
        setHasNext(response.data.hasNext || false);
        setHasPrevious(response.data.hasPrevious || false);
      } else {
        setError(response.message || 'Không thể tải dữ liệu tài liệu');
        setCourseGroups([]);
      }
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; data?: { message?: string } }>;
      const errorMessage = 
        axiosErr.response?.data?.message || 
        axiosErr.response?.data?.data?.message ||
        axiosErr.message ||
        'Đã xảy ra lỗi khi tải tài liệu. Vui lòng thử lại sau.';
      setError(errorMessage);
      setCourseGroups([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params?.keyword, 
    params?.documentType,
    params?.semesterId,
    params?.subjectId,
    params?.pageNumber, 
    params?.pageSize
  ]);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const handleRefetch = useCallback(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  return {
    courseGroups,
    loading,
    error,
    refetch: handleRefetch,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    hasNext,
    hasPrevious,
  };
};

