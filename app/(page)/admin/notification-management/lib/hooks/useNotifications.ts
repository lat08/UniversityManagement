import { useState, useCallback } from 'react';
import { notificationsApi } from '../api/notificationsApi';
import type { Notification, NotificationHistoryFilterDto, PagedResult } from '../types/types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    totalNotifications: 0,
    pendingNotifications: 0,
    sentNotifications: 0,
    cancelledNotifications: 0,
  });

  const fetchNotifications = useCallback(async (params: NotificationHistoryFilterDto = {}) => {
    setLoading(true);
    try {
      const response = await notificationsApi.getHistory({
        ...params,
        pageIndex: params.pageIndex || currentPage,
        pageSize: params.pageSize || 20,
      });
      
      // Support both response formats: success/isSuccess
      const isSuccess = response.success !== undefined ? response.success : (response.isSuccess ?? false);
      
      if (isSuccess && response.data) {
        const responseData = response.data;
        
        // Handle new response structure with paginatedResult and statistics
        // Support both camelCase and PascalCase
        const paginatedResult = (responseData as any).paginatedResult || (responseData as any).PaginatedResult || responseData;
        const statistics = (responseData as any).statistics || (responseData as any).Statistics;
        
        // Extract items array - handle both formats
        let items: Notification[] = [];
        const itemsData = paginatedResult.items || paginatedResult.Items;
        if (Array.isArray(itemsData)) {
          items = itemsData;
        } else if (itemsData && typeof itemsData === 'object') {
          // Handle nested structure if needed
          const itemsObj = itemsData as unknown as { Items?: Notification[]; items?: Notification[] };
          if (Array.isArray(itemsObj.Items)) {
            items = itemsObj.Items;
          } else if (Array.isArray(itemsObj.items)) {
            items = itemsObj.items;
          }
        }
        
        setNotifications(items);
        setTotalCount(paginatedResult.totalCount ?? paginatedResult.TotalCount ?? 0);
        setTotalPages(paginatedResult.totalPages ?? paginatedResult.TotalPages ?? 0);
        setCurrentPage(paginatedResult.pageNumber ?? paginatedResult.PageNumber ?? 1);
        
        // Use statistics from API if available, otherwise calculate from current page
        if (statistics) {
          setStats({
            totalNotifications: statistics.totalNotifications ?? statistics.TotalNotifications ?? 0,
            pendingNotifications: statistics.pendingNotifications ?? statistics.PendingNotifications ?? 0,
            sentNotifications: statistics.sentNotifications ?? statistics.SentNotifications ?? 0,
            cancelledNotifications: statistics.cancelledNotifications ?? statistics.CancelledNotifications ?? 0,
          });
        } else {
          // Fallback: calculate stats from current page data
          const pendingCount = items.filter((n) => n.status?.toLowerCase() === 'pending').length;
          const sentCount = items.filter((n) => n.status?.toLowerCase() === 'sent').length;
          const cancelledCount = items.filter((n) => n.status?.toLowerCase() === 'cancelled').length;
          
          setStats({
            totalNotifications: paginatedResult.totalCount ?? paginatedResult.TotalCount ?? 0,
            pendingNotifications: pendingCount,
            sentNotifications: sentCount,
            cancelledNotifications: cancelledCount,
          });
        }
      } else {
        setNotifications([]);
        setTotalCount(0);
        setTotalPages(0);
        setStats({
          totalNotifications: 0,
          pendingNotifications: 0,
          sentNotifications: 0,
          cancelledNotifications: 0,
        });
      }
    } catch {
      setNotifications([]);
      setTotalCount(0);
      setTotalPages(0);
      setStats({
        totalNotifications: 0,
        pendingNotifications: 0,
        sentNotifications: 0,
        cancelledNotifications: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  return {
    notifications,
    loading,
    currentPage,
    totalCount,
    totalPages,
    stats,
    fetchNotifications,
    setCurrentPage,
  };
};

