import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminExams,
  getAdminExamDetail,
  approveAdminExam,
  rejectAdminExam,
  exportAdminExams,
  exportAdminExamPdf,
} from '@/lib/api/adminExam';
import {
  AdminExamQueryParams,
  AdminExamListResponse,
  AdminExamDetailResponse,
  ApproveExamRequest,
  RejectExamRequest,
} from '@/lib/types/adminExam';
export const useAdminExamsList = (params?: AdminExamQueryParams) =>
  useQuery<AdminExamListResponse>({
    queryKey: ['adminExams', 'list', params ?? {}],
    queryFn: () => getAdminExams(params),
    placeholderData: keepPreviousData,
  });

export const useAdminExamDetail = (id: string | null) =>
  useQuery<AdminExamDetailResponse>({
    queryKey: id ? ['adminExams', 'detail', id] : ['adminExams', 'detail', 'idle'],
    queryFn: () => getAdminExamDetail(id as string),
    enabled: Boolean(id),
  });

export const useApproveAdminExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveExamRequest }) =>
      approveAdminExam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminExams'] });
      queryClient.invalidateQueries({ queryKey: ['adminExams', 'detail', variables.id] });
    },
  });
};

export const useRejectAdminExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectExamRequest }) =>
      rejectAdminExam(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminExams'] });
      queryClient.invalidateQueries({ queryKey: ['adminExams', 'detail', variables.id] });
    },
  });
};

export const useExportAdminExams = () => {
  return useMutation({
    mutationFn: (params?: AdminExamQueryParams) => exportAdminExams(params),
  });
};

export const useExportAdminExamPdf = () => {
  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: 'exam' | 'answer' }) =>
      exportAdminExamPdf(id, type),
  });
};
