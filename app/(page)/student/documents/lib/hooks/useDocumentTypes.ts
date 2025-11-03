import { useState, useEffect, useCallback } from 'react';
import { documentsApi } from '../api/documentsApi';
import { DocumentTypeItem } from '../types/types';
import { AxiosError } from 'axios';

interface UseDocumentTypesReturn {
  documentTypes: DocumentTypeItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch document types
 * @returns Document types data, loading state, error state, and refetch function
 */
export const useDocumentTypes = (): UseDocumentTypesReturn => {
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await documentsApi.getDocumentTypes();
      
      if (response.success) {
        setDocumentTypes(response.data);
      } else {
        setError(response.message || 'Không thể tải danh sách loại tài liệu');
      }
    } catch (err) {
      console.error('[useDocumentTypes] Error:', err);
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(
        axiosErr.response?.data?.message || 
        'Đã xảy ra lỗi khi tải loại tài liệu. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentTypes();
  }, [fetchDocumentTypes]);

  return {
    documentTypes,
    loading,
    error,
    refetch: fetchDocumentTypes,
  };
};

