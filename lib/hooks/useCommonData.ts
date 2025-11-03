import { useState, useEffect, useCallback } from 'react';
import { commonApi } from '../api/common';
import {
  Semester,
  Subject,
  Faculty,
  Department,
  Class,
  AcademicYear,
} from '../types/common';

interface UseCommonDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useSemesters = (): UseCommonDataReturn<Semester> => {
  const [data, setData] = useState<Semester[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commonApi.getSemesters();
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Không thể tải danh sách học kỳ');
        setData([]);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Đã xảy ra lỗi khi tải danh sách học kỳ.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useSubjects = (): UseCommonDataReturn<Subject> => {
  const [data, setData] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commonApi.getSubjects();
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Không thể tải danh sách môn học');
        setData([]);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Đã xảy ra lỗi khi tải danh sách môn học.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useFaculties = (): UseCommonDataReturn<Faculty> => {
  const [data, setData] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commonApi.getFaculties();
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Không thể tải danh sách khoa');
        setData([]);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Đã xảy ra lỗi khi tải danh sách khoa.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useDepartments = (params?: { facultyId?: string }): UseCommonDataReturn<Department> => {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commonApi.getDepartments(params);
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Không thể tải danh sách bộ môn');
        setData([]);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Đã xảy ra lỗi khi tải danh sách bộ môn.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [params?.facultyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useClasses = (params?: { departmentId?: string; facultyId?: string }): UseCommonDataReturn<Class> => {
  const [data, setData] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commonApi.getClasses(params);
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Không thể tải danh sách lớp học');
        setData([]);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Đã xảy ra lỗi khi tải danh sách lớp học.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [params?.departmentId, params?.facultyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export const useAcademicYears = (params?: { count?: number }): UseCommonDataReturn<AcademicYear> => {
  const [data, setData] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commonApi.getAcademicYears(params);
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Không thể tải danh sách năm học');
        setData([]);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'Đã xảy ra lỗi khi tải danh sách năm học.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [params?.count]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

