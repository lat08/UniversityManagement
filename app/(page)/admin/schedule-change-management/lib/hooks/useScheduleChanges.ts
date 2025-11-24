import { useState, useCallback } from 'react';
import { scheduleChangeApi } from '../api/scheduleChangeApi';
import type {
  LeaveRequest,
  LeaveRequestsSearchParams,
  LeaveRequestsResponse,
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

      // Handle both camelCase and PascalCase from backend
      const pageData = response.page || (response as any).Page;
      const statsData = response.stats || (response as any).Stats;

      const items = Array.isArray(pageData?.items)
        ? pageData.items
        : Array.isArray(pageData?.Items)
          ? pageData.Items
          : [];

      // Normalize items to handle both camelCase and PascalCase from backend
      const normalizedItems = items.map((item: any) => ({
        ...item,
        // Handle field name variations
        cancelDate: item.cancelDate || item.CancelDate || '',
        cancelStartPeriod: item.cancelStartPeriod ?? item.CancelStartPeriod ?? 0,
        cancelEndPeriod: item.cancelEndPeriod ?? item.CancelEndPeriod ?? 0,
        oldRoomCode: item.oldRoomCode || item.OldRoomCode || '',
        makeUpDate: item.makeUpDate || item.MakeUpDate || item.makeupDate || item.MakeupDate || '',
        startPeriod: item.startPeriod ?? item.StartPeriod ?? 0,
        endPeriod: item.endPeriod ?? item.EndPeriod ?? 0,
        makeUpRoomCode: item.makeUpRoomCode || item.MakeUpRoomCode || '',
        makeup: item.makeup || item.Makeup || null,
      }));

      setRequests(normalizedItems);
      setTotalCount(pageData?.totalCount ?? pageData?.TotalCount ?? 0);
      setTotalPages(pageData?.totalPages ?? pageData?.TotalPages ?? 0);
      setCurrentPage(pageData?.pageNumber ?? pageData?.PageNumber ?? 1);

      if (statsData) {
        setStats({
          total: statsData.total ?? statsData.Total ?? 0,
          pending: statsData.pending ?? statsData.Pending ?? 0,
          approved: statsData.approved ?? statsData.Approved ?? 0,
          rejected: statsData.rejected ?? statsData.Rejected ?? 0,
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

