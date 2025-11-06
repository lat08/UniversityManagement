import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { instructorGradesApi } from './api';
import type { UpdateStudentGradeDto } from './types';

export const useInstructorCourseClasses = (semesterId?: string) => {
  return useQuery({
    queryKey: ['instructor-course-classes', semesterId],
    queryFn: () => instructorGradesApi.getCourseClasses(semesterId),
  });
};

export const useCourseClassGrades = (courseClassId: string, type?: 'draft' | 'official') => {
  return useQuery({
    queryKey: ['course-class-grades', courseClassId, type],
    queryFn: () => instructorGradesApi.getCourseClassGrades(courseClassId, type),
    enabled: !!courseClassId,
  });
};

export const useUpdateDraftGrade = (courseClassId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gradeData: UpdateStudentGradeDto) =>
      instructorGradesApi.updateDraftGrade(courseClassId, gradeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-class-grades', courseClassId] });
      toast.success('Cập nhật điểm thành công');
    },
    onError: () => {
      toast.error('Cập nhật điểm thất bại');
    },
  });
};

export const useUpdateDraftGradesBulk = (courseClassId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (grades: UpdateStudentGradeDto[]) =>
      instructorGradesApi.updateDraftGradesBulk(courseClassId, grades),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-class-grades', courseClassId] });
      toast.success('Cập nhật điểm hàng loạt thành công');
    },
    onError: () => {
      toast.error('Cập nhật điểm hàng loạt thất bại');
    },
  });
};

export const useSubmitForApproval = (courseClassId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionNote?: string) =>
      instructorGradesApi.submitForApproval(courseClassId, submissionNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-class-grades', courseClassId] });
      queryClient.invalidateQueries({ queryKey: ['instructor-course-classes'] });
      toast.success('Gửi duyệt bảng điểm thành công');
    },
    onError: () => {
      toast.error('Gửi duyệt bảng điểm thất bại');
    },
  });
};

export const useGradeHistory = (courseClassId: string) => {
  return useQuery({
    queryKey: ['grade-history', courseClassId],
    queryFn: () => instructorGradesApi.getGradeHistory(courseClassId),
    enabled: !!courseClassId,
  });
};

export const useGradeVersion = (courseClassId: string, versionNumber: number) => {
  return useQuery({
    queryKey: ['grade-version', courseClassId, versionNumber],
    queryFn: () => instructorGradesApi.getGradeVersion(courseClassId, versionNumber),
    enabled: !!courseClassId && versionNumber > 0,
  });
};

export const useExportGrades = () => {
  return useMutation({
    mutationFn: ({ courseClassId, type }: { courseClassId: string; type?: 'draft' | 'official' }) =>
      instructorGradesApi.exportGrades(courseClassId, type),
    onSuccess: (blob, variables) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grades_${variables.courseClassId}_${variables.type || 'draft'}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Xuất file Excel thành công');
    },
    onError: () => {
      toast.error('Xuất file Excel thất bại');
    },
  });
};




