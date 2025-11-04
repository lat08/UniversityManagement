import { useState, useEffect, useCallback } from "react";
import { notificationApi } from "@/lib/api/notification";
import { NotificationApiItem, NotificationQueryParams, NotificationType } from "@/lib/types/notification";

const PAGE_SIZE = 10;

export const useNotifications = (activeFilter: NotificationType) => {
  const [notifications, setNotifications] = useState<NotificationApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = useCallback(async (filterType: NotificationType, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: NotificationQueryParams = {
        PageIndex: page,
        PageSize: PAGE_SIZE
      };
      
      if (filterType && filterType !== "all") {
        params.NotificationType = filterType;
      }

      const response = await notificationApi.getNotifications(params);
      
      if (response.isSuccess) {
        setNotifications(response.data.notifications.data);
        setTotalPages(response.data.notifications.totalPages);
        setCurrentPage(response.data.notifications.page);
      } else {
        setError(response.resultMessage || "Không thể tải thông báo");
      }
    } catch (err: unknown) {
      console.error('Error fetching notifications:', err);
      setError("Đã xảy ra lỗi khi tải thông báo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchNotifications(activeFilter, 1);
  }, [activeFilter, fetchNotifications]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchNotifications(activeFilter, currentPage);
    }
  }, [currentPage, activeFilter, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await notificationApi.markAsRead(id);
      
      if (response.isSuccess) {
        setNotifications(prev => 
          prev.map(n => n.scheduleId === id ? { ...n, isRead: true } : n)
        );
        return true;
      }
      return false;
    } catch (err: unknown) {
      console.error('Error marking notification as read:', err);
      return false;
    }
  }, []);

  return {
    notifications,
    loading,
    error,
    currentPage,
    totalPages,
    setCurrentPage,
    refetch: () => fetchNotifications(activeFilter, currentPage),
    markAsRead
  };
};
