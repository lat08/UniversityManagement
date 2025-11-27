import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { regulationApi } from '@/lib/api/regulation';
import {
  RegulationListResponse,
  RegulationMutationPayload,
  RegulationQueryParams,
  RegulationRecord,
} from '@/lib/types/regulation';
import { queryKeys } from '@/lib/api/queryKeys';

export const useRegulationsList = (params: RegulationQueryParams) =>
  useQuery<RegulationListResponse>({
    queryKey: queryKeys.regulations.list(params),
    queryFn: () => regulationApi.list(params),
    placeholderData: keepPreviousData,
  });

export const useRegulationDetail = (id: string | null) =>
  useQuery<RegulationRecord>({
    queryKey: id ? queryKeys.regulations.detail(id) : ['regulations', 'detail', 'idle'],
    queryFn: () => regulationApi.getById(id as string),
    enabled: Boolean(id),
  });

export const useCreateRegulation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, file }: { payload: RegulationMutationPayload; file: File | null }) =>
      regulationApi.create(payload, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regulations.all });
    },
  });
};

export const useUpdateRegulation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, file }: { id: string; payload: RegulationMutationPayload; file: File | null }) =>
      regulationApi.update(id, payload, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regulations.all });
    },
  });
};

export const useDeleteRegulation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => regulationApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.regulations.all });
    },
  });
};

/**
 * Hook để lấy thống kê tổng (không bị ảnh hưởng bởi filter)
 */
export const useRegulationsStats = () => {
  return useQuery<RegulationListResponse>({
    queryKey: queryKeys.regulations.list({ pageIndex: 1, pageSize: 1000 }), // Lấy tất cả để tính stats
    queryFn: () => regulationApi.list({ pageIndex: 1, pageSize: 1000 }),
    staleTime: 30000, // Cache 30 giây
  });
};

