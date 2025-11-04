import { useState, useEffect, useCallback } from 'react';
import { examsApi } from '../api/examsApi';
import { ExamEntry, ExamEntryDetail, GetExamEntriesParams } from '../types';

interface UseExamEntriesReturn {
  examEntries: ExamEntry[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useExamEntries = (params?: GetExamEntriesParams): UseExamEntriesReturn => {
  const [examEntries, setExamEntries] = useState<ExamEntry[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExamEntries = useCallback(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await examsApi.getExamEntries(params);
        
        if (response.success && response.data) {
          setExamEntries(response.data.items);
          setTotalCount(response.data.totalCount);
          setPageNumber(response.data.pageNumber);
          setPageSize(response.data.pageSize);
          setTotalPages(response.data.totalPages);
          setHasPreviousPage(response.data.hasPreviousPage);
          setHasNextPage(response.data.hasNextPage);
        } else {
          setError(response.message || 'Không thể tải danh sách đề thi');
          setExamEntries([]);
          setTotalCount(0);
        }
      } catch (err: unknown) {
        const errorMessage = 
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Đã xảy ra lỗi khi tải danh sách đề thi. Vui lòng thử lại sau.';
        setError(errorMessage);
        setExamEntries([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    void loadData();
  }, [
    params?.searchKeyword,
    params?.examType,
    params?.status,
    params?.semesterId,
    params?.subjectId,
    params?.pageNumber,
    params?.pageSize,
  ]);

  useEffect(() => {
    fetchExamEntries();
  }, [fetchExamEntries]);

  const handleRefetch = useCallback(() => {
    fetchExamEntries();
  }, [fetchExamEntries]);

  return {
    examEntries,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    hasPreviousPage,
    hasNextPage,
    loading,
    error,
    refetch: handleRefetch,
  };
};

interface UseExamEntryDetailReturn {
  examEntryDetail: ExamEntryDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

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
      const errorMessage = 
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Đã xảy ra lỗi khi tải chi tiết đề thi. Vui lòng thử lại sau.';
      setError(errorMessage);
      setExamEntryDetail(null);
    } finally {
      setLoading(false);
    }
  }, [examEntryId]);

  useEffect(() => {
    void fetchExamEntryDetail();
  }, [fetchExamEntryDetail]);

  const handleRefetch = useCallback(() => {
    void fetchExamEntryDetail();
  }, [fetchExamEntryDetail]);

  return {
    examEntryDetail,
    loading,
    error,
    refetch: handleRefetch,
  };
};

