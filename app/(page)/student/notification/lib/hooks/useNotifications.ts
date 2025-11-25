import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { notificationApi } from "@/lib/api/notification";
import { NotificationApiItem, NotificationQueryParams, NotificationReadStatus, NotificationType } from "@/lib/types/notification";

const PAGE_SIZE = 10;

interface UseNotificationsOptions {
  notificationType: NotificationType;
  readStatus: NotificationReadStatus;
  role?: string;
  searchTerm?: string;
}

export const useNotifications = (options: UseNotificationsOptions) => {
  const { notificationType, readStatus, role, searchTerm } = options;
  const translationNamespace = role === "Instructor" ? "instructor.notification" : "student.notification";
  const t = useTranslations(translationNamespace);
  const [notifications, setNotifications] = useState<NotificationApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchNotifications = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: NotificationQueryParams = {
        PageIndex: page,
        PageSize: PAGE_SIZE,
        Role: role,
      };
      
      if (notificationType && notificationType !== "all") {
        params.NotificationType = notificationType;
      }

      if (searchTerm) {
        params.SearchTerm = searchTerm;
      }

      if (readStatus !== "all") {
        params.IsRead = readStatus === "read";
      }

      const response = await notificationApi.getNotifications(params);
      
      if (response.isSuccess) {
        setNotifications(response.data.notifications.data);
        setTotalPages(response.data.notifications.totalPages);
        setTotalCount(response.data.notifications.totalCount);
        setCurrentPage(response.data.notifications.page);
      } else {
        setError(response.resultMessage || t('error.title'));
      }
    } catch {
      setError(t('error.title'));
    } finally {
      setLoading(false);
    }
  }, [notificationType, readStatus, role, searchTerm]);

  // Reset to page 1 when filter/search/role changes
  useEffect(() => {
    setCurrentPage(1);
  }, [notificationType, readStatus, role, searchTerm]);

  // Fetch notifications when dependencies change
  useEffect(() => {
    void fetchNotifications(currentPage);
  }, [currentPage, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await notificationApi.markAsRead(id);
      
      if (response.isSuccess) {
        setNotifications(prev => {
          if (readStatus === "unread") {
            return prev.filter(notification => notification.scheduleId !== id);
          }
          return prev.map(notification => 
            notification.scheduleId === id ? { ...notification, isRead: true } : notification
          );
        });
        // Notify other parts of the app (e.g., header bell) to refresh unread count
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('notifications:updated', { detail: { source: 'markAsRead', id } }))
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [readStatus]);

  return {
    notifications,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    pageSize: PAGE_SIZE,
    setCurrentPage,
    refetch: () => fetchNotifications(currentPage),
    markAsRead
  };
};
