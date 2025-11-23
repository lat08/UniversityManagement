import { useMutation, useQueryClient } from '@tanstack/react-query';
import { examsApi } from '../api/examsApi';
import { UploadExamRequest, UpdateExamRequest } from '../types';
import { queryKeys } from '@/lib/api/queryKeys';
import toast from 'react-hot-toast';

export const useExamActions = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (data: UploadExamRequest) => examsApi.uploadExamEntry(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Tải lên đề thi thành công!');
        void queryClient.invalidateQueries({ queryKey: queryKeys.exams.lists() });
        onSuccess?.();
      } else {
        toast.error(response.message || 'Tải lên đề thi thất bại');
      }
    },
    onError: (err: unknown) => {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Lỗi khi tải lên đề thi';
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ examEntryId, data }: { examEntryId: string; data: UpdateExamRequest }) =>
      examsApi.updateExamEntry(examEntryId, data),
    onSuccess: (response, variables) => {
      if (response.success) {
        toast.success(response.message || 'Cập nhật đề thi thành công!');
        void queryClient.invalidateQueries({ queryKey: queryKeys.exams.lists() });
        void queryClient.invalidateQueries({ queryKey: queryKeys.exams.detail(variables.examEntryId) });
        onSuccess?.();
      } else {
        toast.error(response.message || 'Cập nhật đề thi thất bại');
      }
    },
    onError: (err: unknown) => {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Lỗi khi cập nhật đề thi';
      toast.error(errorMessage);
    },
  });

  const uploadExam = async (data: UploadExamRequest): Promise<boolean> => {
    try {
      await uploadMutation.mutateAsync(data);
      return true;
    } catch {
      return false;
    }
  };

  const updateExam = async (examEntryId: string, data: UpdateExamRequest): Promise<boolean> => {
    try {
      await updateMutation.mutateAsync({ examEntryId, data });
      return true;
    } catch {
      return false;
    }
  };

  const downloadExamFile = (fileUrl: string, fileName?: string): boolean => {
    try {
      if (!fileUrl) {
        toast.error('Không tìm thấy đường dẫn file');
        return false;
      }

      // Tải trực tiếp từ Supabase public URL
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName || fileUrl.split('/').pop() || 'file';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Đang tải xuống file...');
      return true;
    } catch (err: unknown) {
      const errorMessage = 
        (err as { message?: string })?.message ||
        'Lỗi khi tải xuống file';
      toast.error(errorMessage);
      return false;
    }
  };

  return {
    uploadExam,
    updateExam,
    downloadExamFile,
    isUploading: uploadMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};

