import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { commonApi } from '@/lib/api/common';
import { getTuitionFees, getInsurances, getPayments, payCourses, payInsurance } from '../api/financeApi';
import type { TuitionFeeResponse, InsuranceResponse, PaymentHistoryResponse, Semester, PaymentResponse } from '../types/types';

export const QUERY_KEYS = {
  finance: ['finance'] as const,
  semesters: () => [...QUERY_KEYS.finance, 'semesters'] as const,
  tuition: (semesterId: string | null) => [...QUERY_KEYS.finance, 'tuition', semesterId] as const,
  insurance: () => [...QUERY_KEYS.finance, 'insurance'] as const,
  payments: () => [...QUERY_KEYS.finance, 'payments'] as const,
} as const;

interface SemestersData {
  semesters: Semester[];
  defaultSemesterId: string | null;
}

export const useSemesters = () => {
  return useQuery<SemestersData, Error>({
    queryKey: QUERY_KEYS.semesters(),
    queryFn: async (): Promise<SemestersData> => {
      const response = await commonApi.getSemesters();
      if (!response.success || !response.data) {
        return { semesters: [], defaultSemesterId: null };
      }

      const now = new Date();
      const allSemesters = response.data
        .filter(s => s.registrationStartDate && new Date(s.registrationStartDate) <= now)
        .map(s => ({
          semesterId: s.semesterId,
          semesterName: s.semesterName,
        }));

      const activeSemester = response.data.find(semester => {
        if (!semester.registrationStartDate || !semester.registrationEndDate) return false;
        const startDate = new Date(semester.registrationStartDate);
        const endDate = new Date(semester.registrationEndDate);
        return now >= startDate && now <= endDate;
      });

      const defaultSemesterId = activeSemester?.semesterId || allSemesters[0]?.semesterId || null;

      return { semesters: allSemesters, defaultSemesterId };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useTuitionData = (semesterId: string | null, enabled = true) => {
  return useQuery<TuitionFeeResponse['data'] | null, Error>({
    queryKey: QUERY_KEYS.tuition(semesterId),
    queryFn: async (): Promise<TuitionFeeResponse['data'] | null> => {
      if (!semesterId) return null;
      const response = await getTuitionFees(semesterId);
      if (!response.success) {
        if (response.message === "Không tìm thấy thông tin học phí.") {
          throw new Error('Sinh viên chưa đăng ký môn học');
        }
        throw new Error(response.message || 'Tải dữ liệu học phí thất bại');
      }
      return response.data;
    },
    enabled: enabled && semesterId !== null,
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useInsuranceData = (enabled = false) => {
  return useQuery<InsuranceResponse['data'], Error>({
    queryKey: QUERY_KEYS.insurance(),
    queryFn: async (): Promise<InsuranceResponse['data']> => {
      const response = await getInsurances();
      if (!response.success) {
        throw new Error(response.message || 'Tải dữ liệu bảo hiểm thất bại');
      }
      return response.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const usePaymentsData = (enabled = false) => {
  return useQuery<PaymentHistoryResponse['data'], Error>({
    queryKey: QUERY_KEYS.payments(),
    queryFn: async (): Promise<PaymentHistoryResponse['data']> => {
      const response = await getPayments();
      if (!response.success) {
        throw new Error(response.message || 'Tải dữ liệu lịch sử thanh toán thất bại');
      }
      return response.data;
    },
    enabled,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const usePayCourseMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PaymentResponse, Error, string[]>({
    mutationFn: payCourses,
    onSuccess: (_, semesterId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tuition(semesterId[0]) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments() });
    },
  });
};

export const usePayInsuranceMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<PaymentResponse, Error, string>({
    mutationFn: payInsurance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.insurance() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments() });
    },
  });
};

export const useInvalidateFinanceData = () => {
  const queryClient = useQueryClient();

  return {
    invalidateTuition: (semesterId: string | null) => {
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tuition(semesterId) });
    },
    invalidateInsurance: () => {
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.insurance() });
    },
    invalidatePayments: () => {
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payments() });
    },
    invalidateAll: () => {
      return queryClient.invalidateQueries({ queryKey: QUERY_KEYS.finance });
    },
  };
};

export const usePrefetchFinanceData = () => {
  const queryClient = useQueryClient();

  return {
    prefetchTuition: async (semesterId: string | null) => {
      if (!semesterId) return;
      await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.tuition(semesterId),
        queryFn: async () => {
          const response = await getTuitionFees(semesterId);
          return response.success ? response.data : null;
        },
        staleTime: 3 * 60 * 1000,
      });
    },
    prefetchInsurance: async () => {
      await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.insurance(),
        queryFn: async () => {
          const response = await getInsurances();
          return response.success ? response.data : [];
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchPayments: async () => {
      await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.payments(),
        queryFn: async () => {
          const response = await getPayments();
          return response.success ? response.data : [];
        },
        staleTime: 60 * 1000,
      });
    },
  };
};
