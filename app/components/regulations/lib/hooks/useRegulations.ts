import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import { regulationsApi, type Regulation, type RegulationQueryParams } from '../api/regulationsApi';

interface UseRegulationsReturn {
  readonly data: Regulation[] | undefined;
  readonly isPending: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<void>;
  readonly isRefetching: boolean;
}

const REGULATIONS_STALE_TIME = 5 * 60 * 1000;
const REGULATIONS_GC_TIME = 10 * 60 * 1000;

const fetchRegulations = async (params: RegulationQueryParams): Promise<Regulation[]> => {
  const response = await regulationsApi.getRegulations(params);

  if (!response.isSuccess) {
    throw new Error('Không thể tải dữ liệu quy chế');
  }

  return response.data.data;
};

export const useRegulations = (params: RegulationQueryParams = {}): UseRegulationsReturn => {
  const queryKey = queryKeys.regulations.list(params);

  const { 
    data, 
    isPending, 
    error, 
    refetch: queryRefetch,
    isRefetching,
  } = useQuery({
    queryKey,
    queryFn: () => fetchRegulations(params),
    staleTime: REGULATIONS_STALE_TIME,
    gcTime: REGULATIONS_GC_TIME,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const normalizedError = error
    ? error instanceof Error
      ? error.message
      : 'Đã xảy ra lỗi không xác định'
    : null;

  const refetch = useCallback(async () => {
    await queryRefetch();
  }, [queryRefetch]);

  return {
    data,
    isPending,
    error: normalizedError,
    refetch,
    isRefetching,
  };
};

