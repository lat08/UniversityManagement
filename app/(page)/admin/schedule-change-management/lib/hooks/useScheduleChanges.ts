import { useState, useCallback } from 'react';
import { scheduleChangeApi } from '../api/scheduleChangeApi';
import type {
  LeaveRequest,
  LeaveRequestsSearchParams,
  LeaveRequestsStats,
} from '../types/types';

export const useScheduleChanges = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState<LeaveRequestsStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const fetchScheduleChanges = useCallback(async (params: LeaveRequestsSearchParams = {}) => {
    setLoading(true);
    try {
      const response = await scheduleChangeApi.search({
        ...params,
        pageNumber: params.pageNumber || currentPage,
        pageSize: params.pageSize || 20,
      });

      const pageData = response.page;
      const statsData = response.stats;

      setRequests(pageData.items ?? []);
      setTotalCount(pageData.totalCount ?? 0);
      setTotalPages(pageData.totalPages ?? 0);
      setCurrentPage(pageData.pageNumber ?? 1);

      if (statsData) {
        setStats({
          total: statsData.total ?? 0,
          pending: statsData.pending ?? 0,
          approved: statsData.approved ?? 0,
          rejected: statsData.rejected ?? 0,
        });
      }
    } catch {
      setRequests([]);
      setTotalCount(0);
      setTotalPages(0);
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  return {
    requests,
    loading,
    currentPage,
    totalCount,
    totalPages,
    stats,
    fetchScheduleChanges,
    setCurrentPage,
  };
};

