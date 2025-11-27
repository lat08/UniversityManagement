import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/api/queryKeys';
import { regulationsApi, type RegulationQueryParams } from '../api/regulationsApi';

export const usePrefetchRegulations = () => {
  const queryClient = useQueryClient();

  const prefetchRegulations = async (params: RegulationQueryParams = {}) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.regulations.list(params),
      queryFn: async () => {
        const response = await regulationsApi.getRegulations(params);
        if (!response.isSuccess) {
          throw new Error('Không thể tải dữ liệu quy chế');
        }
        return response.data.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchRegulations };
};
