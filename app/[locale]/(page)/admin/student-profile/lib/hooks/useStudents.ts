import { useState, useEffect, useCallback } from 'react';
import { studentsApi } from '../api/studentsApi';
import { Student, GetStudentsParams } from '../types/types';

interface UseStudentsReturn {
  students: Student[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  currentPage: number;
  refetch: () => Promise<void>;
}

export const useStudents = (params: GetStudentsParams = {}): UseStudentsReturn => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(params.pageNumber || 1);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await studentsApi.getStudents(params);

      if (response.success) {
        setStudents(response.data.students);
        setTotalCount(response.data.pagination.totalCount);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
      } else {
        setError(response.message || 'Không thể tải danh sách sinh viên');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    refetch: fetchStudents,
  };
};

