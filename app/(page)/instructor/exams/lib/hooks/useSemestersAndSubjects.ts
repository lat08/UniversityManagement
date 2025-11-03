import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api/client';

export interface Semester {
  semesterId: string;
  semesterName: string;
  semesterType: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface Subject {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits?: number;
  theoryHours?: number;
  practiceHours?: number;
  status?: string;
  departmentName?: string;
}

interface SemestersResponse {
  success: boolean;
  data: Semester[];
  message?: string;
}

interface SubjectsResponse {
  success: boolean;
  data: Subject[];
  message?: string;
}

export const useSemesters = () => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSemesters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<SemestersResponse>('/v1/common/semesters');
      if (response.data.success && response.data.data) {
        setSemesters(response.data.data);
      } else {
        setError('Không thể tải danh sách học kỳ');
        setSemesters([]);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }, message?: string };
      const errorMessage = e.response?.data?.message || e.message || 'Đã xảy ra lỗi khi tải danh sách học kỳ';
      setError(errorMessage);
      setSemesters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSemesters();
  }, [fetchSemesters]);

  return { semesters, loading, error, refetch: fetchSemesters };
};

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<SubjectsResponse>('/v1/common/subjects');
      if (response.data.success && response.data.data) {
        setSubjects(response.data.data);
      } else {
        setError('Không thể tải danh sách môn học');
        setSubjects([]);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }, message?: string };
      const errorMessage = e.response?.data?.message || e.message || 'Đã xảy ra lỗi khi tải danh sách môn học';
      setError(errorMessage);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  return { subjects, loading, error, refetch: fetchSubjects };
};

