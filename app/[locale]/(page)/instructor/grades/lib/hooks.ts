import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { instructorGradesApi } from './api';
import { commonApi } from '@/lib/api/common';
import { queryKeys } from '@/lib/api/queryKeys';
import type { UpdateStudentGradeDto, CourseClassGradesDto } from './types';

export const useSemesters = () => {
  return useQuery({
    queryKey: ['semesters'],
    queryFn: () => commonApi.getSemesters(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useInstructorCourseClasses = (semesterId?: string) => {
  return useQuery({
    queryKey: queryKeys.instructorGrades.courseClasses(semesterId),
    queryFn: () => instructorGradesApi.getCourseClasses(semesterId),
    staleTime: 3 * 60 * 1000, // 3 phút
    gcTime: 10 * 60 * 1000, // 10 phút
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const useCourseClassGrades = (courseClassId: string, type?: 'draft' | 'official') => {
  const isDraft = type === 'draft' || !type;
  
  return useQuery({
    queryKey: queryKeys.instructorGrades.grades(courseClassId, type),
    queryFn: () => instructorGradesApi.getCourseClassGrades(courseClassId, type),
    enabled: !!courseClassId,
    staleTime: isDraft ? 30 * 1000 : 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000, // 10 phút
    refetchOnWindowFocus: isDraft,
    retry: 2,
  });
};

export const useUpdateDraftGrade = (courseClassId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gradeData: UpdateStudentGradeDto) =>
      instructorGradesApi.updateDraftGrade(courseClassId, gradeData),
    onMutate: async (updatedGrade) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.instructorGrades.grades(courseClassId, 'draft') 
      });

      const previousGrades = queryClient.getQueryData(
        queryKeys.instructorGrades.grades(courseClassId, 'draft')
      );

      queryClient.setQueryData(
        queryKeys.instructorGrades.grades(courseClassId, 'draft'),
        (old: { data: CourseClassGradesDto } | undefined) => {
          if (!old) return old;
          
          return {
            ...old,
            data: {
              ...old.data,
              students: old.data.students.map((student) =>
                student.enrollmentId === updatedGrade.enrollmentId
                  ? {
                      ...student,
                      attendanceGrade: updatedGrade.attendanceGrade ?? student.attendanceGrade,
                      midtermGrade: updatedGrade.midtermGrade ?? student.midtermGrade,
                      finalGrade: updatedGrade.finalGrade ?? student.finalGrade,
                      note: updatedGrade.note !== undefined ? updatedGrade.note : student.note,
                    }
                  : student
              ),
            },
          };
        }
      );

      return { previousGrades };
    },
    onError: (error, variables, context) => {
      if (context?.previousGrades) {
        queryClient.setQueryData(
          queryKeys.instructorGrades.grades(courseClassId, 'draft'),
          context.previousGrades
        );
      }
      toast.error('Cập nhật điểm thất bại');
    },
    onSuccess: () => {
      toast.success('Cập nhật điểm thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.instructorGrades.grades(courseClassId, 'draft') 
      });
    },
  });
};

export const useUpdateDraftGradesBulk = (courseClassId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (grades: UpdateStudentGradeDto[]) =>
      instructorGradesApi.updateDraftGradesBulk(courseClassId, grades),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.instructorGrades.grades(courseClassId, 'draft') 
      });
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
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.instructorGrades.grades(courseClassId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.instructorGrades.courseClasses() 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.instructorGrades.history(courseClassId) 
      });
      toast.success('Gửi duyệt bảng điểm thành công');
    },
    onError: () => {
      toast.error('Gửi duyệt bảng điểm thất bại');
    },
  });
};

export const useGradeHistory = (courseClassId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.instructorGrades.history(courseClassId),
    queryFn: () => instructorGradesApi.getGradeHistory(courseClassId),
    enabled: !!courseClassId && enabled,
    staleTime: 1 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useGradeVersion = (courseClassId: string, versionNumber: number) => {
  return useQuery({
    queryKey: queryKeys.instructorGrades.version(courseClassId, versionNumber),
    queryFn: () => instructorGradesApi.getGradeVersion(courseClassId, versionNumber),
    enabled: !!courseClassId && versionNumber > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
      const typeLabel = variables.type === 'official' ? 'chinh_thuc' : 'ban_nhap';
      link.download = `bangdiem_${variables.courseClassId}_${typeLabel}.xlsx`;
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

export const useUpdateGradeNote = (courseClassId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, note }: { enrollmentId: string; note: string | null }) =>
      instructorGradesApi.updateGradeNote(courseClassId, enrollmentId, note),
    onMutate: async ({ enrollmentId, note }) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.instructorGrades.grades(courseClassId, 'draft') 
      });

      const previousGrades = queryClient.getQueryData(
        queryKeys.instructorGrades.grades(courseClassId, 'draft')
      );

      queryClient.setQueryData(
        queryKeys.instructorGrades.grades(courseClassId, 'draft'),
        (old: { data: CourseClassGradesDto } | undefined) => {
          if (!old) return old;
          
          return {
            ...old,
            data: {
              ...old.data,
              students: old.data.students.map((student) =>
                student.enrollmentId === enrollmentId
                  ? { ...student, note }
                  : student
              ),
            },
          };
        }
      );

      return { previousGrades };
    },
    onError: (error, variables, context) => {
      if (context?.previousGrades) {
        queryClient.setQueryData(
          queryKeys.instructorGrades.grades(courseClassId, 'draft'),
          context.previousGrades
        );
      }
      toast.error('Cập nhật ghi chú thất bại');
    },
    onSuccess: () => {
      toast.success('Cập nhật ghi chú thành công');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.instructorGrades.grades(courseClassId, 'draft') 
      });
    },
  });
};