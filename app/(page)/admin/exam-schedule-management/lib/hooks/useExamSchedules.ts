import { useState, useCallback } from 'react';
import { examSchedulesApi } from '../api/examSchedulesApi';
import type { ExamSchedule, GetExamSchedulesParams } from '../types/types';

export const useExamSchedules = () => {
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchExamSchedules = useCallback(async (params: GetExamSchedulesParams = {}) => {
    setLoading(true);
    try {
      const response = await examSchedulesApi.getList(params);

      // Response is already normalized by examSchedulesApi.getList()
      if (response.success && Array.isArray(response.data)) {
        setExamSchedules(response.data);
        setTotalCount(response.totalCount);
        setTotalPages(Math.ceil(response.totalCount / response.pageSize));
        setCurrentPage(response.pageNumber);
      } else {
        console.warn('Invalid response format:', response);
        setExamSchedules([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error: unknown) {
      console.error('Error fetching exam schedules:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: unknown }; message?: string };
        console.error('Error details:', apiError.response?.data || apiError.message);
      }
      setExamSchedules([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    examSchedules,
    loading,
    currentPage,
    totalCount,
    totalPages,
    fetchExamSchedules,
    setCurrentPage,
  };
};

