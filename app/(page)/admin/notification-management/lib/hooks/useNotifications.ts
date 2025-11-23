import { useState, useCallback } from 'react';
import { notificationsApi } from '../api/notificationsApi';
import type { Notification, NotificationHistoryFilterDto, NotificationHistoryResponse } from '../types/types';

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
        interface ResponseDataWithVariants {
          paginatedResult?: NotificationHistoryResponse['paginatedResult'];
          PaginatedResult?: NotificationHistoryResponse['paginatedResult'];
          statistics?: NotificationHistoryResponse['statistics'];
          Statistics?: NotificationHistoryResponse['statistics'];
        }
        
        const responseDataTyped = responseData as NotificationHistoryResponse | ResponseDataWithVariants;
        let paginatedResult: NotificationHistoryResponse['paginatedResult'] | undefined;
        let statistics: NotificationHistoryResponse['statistics'] | undefined;
        
        if ('paginatedResult' in responseDataTyped && responseDataTyped.paginatedResult) {
          paginatedResult = responseDataTyped.paginatedResult;
        } else if ('PaginatedResult' in responseDataTyped && responseDataTyped.PaginatedResult) {
          paginatedResult = responseDataTyped.PaginatedResult;
        } else if ('paginatedResult' in responseDataTyped || 'PaginatedResult' in responseDataTyped) {
          // Fallback: treat as paginatedResult directly
          paginatedResult = responseDataTyped as NotificationHistoryResponse['paginatedResult'];
        }
        
        if ('statistics' in responseDataTyped) {
          statistics = responseDataTyped.statistics;
        } else if ('Statistics' in responseDataTyped) {
          statistics = responseDataTyped.Statistics;
        }
        
        // Extract items array - handle both formats
        let items: Notification[] = [];
        if (!paginatedResult) {
          items = [];
        } else {
          const itemsData = paginatedResult.items || (paginatedResult as unknown as { Items?: Notification[] }).Items;
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
        }
        
        setNotifications(items);
        const totalCountValue = paginatedResult 
          ? (paginatedResult.totalCount ?? (paginatedResult as unknown as { TotalCount?: number }).TotalCount ?? 0)
          : 0;
        const totalPagesValue = paginatedResult
          ? (paginatedResult.totalPages ?? (paginatedResult as unknown as { TotalPages?: number }).TotalPages ?? 0)
          : 0;
        const pageNumberValue = paginatedResult
          ? (paginatedResult.pageNumber ?? (paginatedResult as unknown as { PageNumber?: number }).PageNumber ?? 1)
          : 1;
        setTotalCount(totalCountValue);
        setTotalPages(totalPagesValue);
        setCurrentPage(pageNumberValue);
        
        // Use statistics from API if available, otherwise calculate from current page
        if (statistics) {
          const statsTyped = statistics as NotificationHistoryResponse['statistics'] | { TotalNotifications?: number; PendingNotifications?: number; SentNotifications?: number; CancelledNotifications?: number };
          setStats({
            totalNotifications: 'totalNotifications' in statsTyped 
              ? statsTyped.totalNotifications 
              : (statsTyped as { TotalNotifications?: number }).TotalNotifications ?? 0,
            pendingNotifications: 'pendingNotifications' in statsTyped
              ? statsTyped.pendingNotifications
              : (statsTyped as { PendingNotifications?: number }).PendingNotifications ?? 0,
            sentNotifications: 'sentNotifications' in statsTyped
              ? statsTyped.sentNotifications
              : (statsTyped as { SentNotifications?: number }).SentNotifications ?? 0,
            cancelledNotifications: 'cancelledNotifications' in statsTyped
              ? statsTyped.cancelledNotifications
              : (statsTyped as { CancelledNotifications?: number }).CancelledNotifications ?? 0,
          });
        } else {
          // Fallback: calculate stats from current page data
          const pendingCount = items.filter((n) => n.status?.toLowerCase() === 'pending').length;
          const sentCount = items.filter((n) => n.status?.toLowerCase() === 'sent').length;
          const cancelledCount = items.filter((n) => n.status?.toLowerCase() === 'cancelled').length;
          
          setStats({
            totalNotifications: totalCountValue,
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

