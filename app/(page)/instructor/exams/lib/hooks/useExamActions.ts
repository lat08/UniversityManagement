import { useState, useCallback } from 'react';
import { examsApi } from '../api/examsApi';
import { UploadExamRequest, UpdateExamRequest } from '../types';
import { downloadFileBlob } from '@/lib/utils/fileDownload';
import toast from 'react-hot-toast';

export const useExamActions = (onSuccess?: () => void) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const uploadExam = useCallback(async (data: UploadExamRequest) => {
    try {
      setIsUploading(true);
      const response = await examsApi.uploadExamEntry(data);
      
      if (response.success) {
        toast.success(response.message || 'Tải lên đề thi thành công!');
        onSuccess?.();
        return true;
      } else {
        toast.error(response.message || 'Tải lên đề thi thất bại');
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Lỗi khi tải lên đề thi';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [onSuccess]);

  const updateExam = useCallback(async (examEntryId: string, data: UpdateExamRequest) => {
    try {
      setIsUpdating(true);
      const response = await examsApi.updateExamEntry(examEntryId, data);
      
      if (response.success) {
        toast.success(response.message || 'Cập nhật đề thi thành công!');
        onSuccess?.();
        return true;
      } else {
        toast.error(response.message || 'Cập nhật đề thi thất bại');
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Lỗi khi cập nhật đề thi';
      toast.error(errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, [onSuccess]);

  const downloadExamFile = useCallback(async (
    examEntryId: string,
    fileType: 'question' | 'answer',
    fileName?: string
  ) => {
    try {
      const blob = await examsApi.downloadExamFile(examEntryId, fileType);
      downloadFileBlob(blob, fileName || `exam_${fileType}_${examEntryId}.pdf`);
      toast.success('Tải xuống thành công!');
      return true;
    } catch (err: unknown) {
      const errorMessage = 
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Lỗi khi tải xuống file';
      toast.error(errorMessage);
      return false;
    }
  }, []);

  return {
    uploadExam,
    updateExam,
    downloadExamFile,
    isUploading,
    isUpdating,
  };
};

