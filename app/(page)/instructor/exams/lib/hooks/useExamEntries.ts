import { useState, useEffect, useCallback, useMemo } from 'react';
import { examsApi } from '../api/examsApi';
import { ExamEntry, ExamEntryDetail, GetExamEntriesParams } from '../types';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { SEARCH_DEBOUNCE_MS } from '../constants';

interface UseExamEntriesReturn {
  examEntries: ExamEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage exam entries
 * @param params - Optional search and filter parameters
 * @returns Exam entries data, loading state, error state, and refetch function
 */
export const useExamEntries = (params?: GetExamEntriesParams): UseExamEntriesReturn => {
  const [examEntries, setExamEntries] = useState<ExamEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExamEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await examsApi.getExamEntries(params);
      
      if (response.success && response.data) {
        setExamEntries(response.data);
      } else {
        setError(response.message || 'Không thể tải danh sách đề thi');
        setExamEntries([]);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }, message?: string };
      const errorMessage = 
        e.response?.data?.message ||
        e.message ||
        'Đã xảy ra lỗi khi tải danh sách đề thi. Vui lòng thử lại sau.';
      setError(errorMessage);
      setExamEntries([]);
    } finally {
      setLoading(false);
    }
  }, [
    params?.searchTerm,
    params?.examType,
    params?.entryStatus,
    params?.semesterId,
    params?.subjectId,
    params,
  ]);

  useEffect(() => {
    fetchExamEntries();
  }, [fetchExamEntries]);

  return {
    examEntries,
    loading,
    error,
    refetch: fetchExamEntries,
  };
};

interface UseExamEntryDetailReturn {
  examEntryDetail: ExamEntryDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch exam entry detail
 * @param examEntryId - Exam entry ID
 * @returns Exam entry detail, loading state, error state, and refetch function
 */
export const useExamEntryDetail = (
  examEntryId: string | null
): UseExamEntryDetailReturn => {
  const [examEntryDetail, setExamEntryDetail] = useState<ExamEntryDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExamEntryDetail = useCallback(async () => {
    if (!examEntryId) {
      setExamEntryDetail(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await examsApi.getExamEntryDetail(examEntryId);
      
      if (response.success && response.data) {
        setExamEntryDetail(response.data);
      } else {
        setError(response.message || 'Không thể tải chi tiết đề thi');
        setExamEntryDetail(null);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }, message?: string };
      const errorMessage = 
        e.response?.data?.message ||
        e.message ||
        'Đã xảy ra lỗi khi tải chi tiết đề thi. Vui lòng thử lại sau.';
      setError(errorMessage);
      setExamEntryDetail(null);
    } finally {
      setLoading(false);
    }
  }, [examEntryId]);

  useEffect(() => {
    fetchExamEntryDetail();
  }, [fetchExamEntryDetail]);

  return {
    examEntryDetail,
    loading,
    error,
    refetch: fetchExamEntryDetail,
  };
};

/**
 * Hook for real-time search with debounce
 */
export const useExamEntriesSearch = (
  searchQuery: string,
  filters: Omit<GetExamEntriesParams, 'searchTerm'>
) => {
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS);

  const params: GetExamEntriesParams = useMemo(() => ({
    searchTerm: debouncedSearchQuery || undefined,
    ...filters,
  }), [debouncedSearchQuery, filters]);

  return useExamEntries(params);
};

