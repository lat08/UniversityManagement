import { useState, useEffect, useCallback } from 'react';
import { commonApi } from '../api/common';
import {
  Semester,
  Subject,
  Faculty,
  Department,
  Class,
  AcademicYear,
  Building,
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
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Đã xảy ra lỗi khi tải danh sách học kỳ.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleRefetch = useCallback(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: handleRefetch };
};

export const useSubjects = (params?: { instructorId?: string }): UseCommonDataReturn<Subject> => {
  const [data, setData] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const instructorId = params?.instructorId;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commonApi.getSubjects(instructorId ? { instructorId } : undefined);
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Không thể tải danh sách môn học');
        setData([]);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Đã xảy ra lỗi khi tải danh sách môn học.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleRefetch = useCallback(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: handleRefetch };
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
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
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

  const handleRefetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: handleRefetch };
};

export const useDepartments = (params?: { facultyId?: string }): UseCommonDataReturn<Department> => {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const facultyId = params?.facultyId;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commonApi.getDepartments(facultyId ? { facultyId } : undefined);
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Không thể tải danh sách bộ môn');
        setData([]);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Đã xảy ra lỗi khi tải danh sách bộ môn.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [facultyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: handleRefetch };
};

export const useClasses = (params?: { departmentId?: string; facultyId?: string }): UseCommonDataReturn<Class> => {
  const [data, setData] = useState<Class[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const departmentId = params?.departmentId;
  const facultyId = params?.facultyId;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commonApi.getClasses(
        departmentId || facultyId ? { departmentId, facultyId } : undefined
      );
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Không thể tải danh sách lớp học');
        setData([]);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Đã xảy ra lỗi khi tải danh sách lớp học.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [departmentId, facultyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: handleRefetch };
};

export const useAcademicYears = (params?: { count?: number }): UseCommonDataReturn<AcademicYear> => {
  const [data, setData] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const count = params?.count;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commonApi.getAcademicYears(count ? { count } : undefined);
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Không thể tải danh sách năm học');
        setData([]);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Đã xảy ra lỗi khi tải danh sách năm học.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [count]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: handleRefetch };
};

export const useBuildings = (): UseCommonDataReturn<Building> => {
  const [data, setData] = useState<Building[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commonApi.getBuildings();
      if (response.success && response.data) {
        setData(Array.isArray(response.data) ? response.data : []);
      } else {
        setError('Không thể tải danh sách cơ sở');
        setData([]);
      }
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        'Đã xảy ra lỗi khi tải danh sách cơ sở.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleRefetch = useCallback(() => {
    void fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: handleRefetch };
};

