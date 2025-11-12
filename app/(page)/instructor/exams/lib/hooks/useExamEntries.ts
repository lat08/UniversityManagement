import { useQuery } from '@tanstack/react-query';
import { examsApi } from '../api/examsApi';
import { GetExamEntriesParams, ExamEntry, ExamEntryDetail } from '../types';
import { queryKeys } from '@/lib/api/queryKeys';
import { useMemo } from 'react';

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

const normalizeParams = (params?: GetExamEntriesParams): GetExamEntriesParams => {
  if (!params) return {};
  
  return Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .sort(([a], [b]) => a.localeCompare(b))
  ) as GetExamEntriesParams;
};

export const useExamEntries = (params?: GetExamEntriesParams): UseExamEntriesReturn => {
  const normalizedParams = useMemo(() => normalizeParams(params), [params]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.exams.list(normalizedParams),
    queryFn: async () => {
      const response = await examsApi.getExamEntries(normalizedParams);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Không thể tải danh sách đề thi');
      }
      return response.data;
    },
    staleTime: 30000,
    gcTime: 300000,
    refetchOnWindowFocus: false,
  });

  return {
    examEntries: data?.items ?? [],
    totalCount: data?.totalCount ?? 0,
    pageNumber: data?.pageNumber ?? 1,
    pageSize: data?.pageSize ?? 10,
    totalPages: data?.totalPages ?? 0,
    hasPreviousPage: data?.hasPreviousPage ?? false,
    hasNextPage: data?.hasNextPage ?? false,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refetch: () => void refetch(),
  };
};

interface UseExamEntryDetailReturn {
  examEntryDetail: ExamEntryDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useExamEntryDetail = (examEntryId: string | null): UseExamEntryDetailReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.exams.detail(examEntryId ?? ''),
    queryFn: async () => {
      if (!examEntryId) {
        throw new Error('Exam entry ID is required');
      }
      const response = await examsApi.getExamEntryDetail(examEntryId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Không thể tải chi tiết đề thi');
      }
      return response.data;
    },
    enabled: !!examEntryId,
    staleTime: 60000,
    gcTime: 300000,
  });

  return {
    examEntryDetail: data ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refetch: () => void refetch(),
  };
};

