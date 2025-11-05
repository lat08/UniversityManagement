"use client";

import { Loader2, CheckCheck } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Tabs } from "@/app/components/ui/tabs";
import { NotificationCard } from "@/app/components/notification/NotificationCard";
import { NotificationType, NotificationApiItem } from "@/lib/types/notification";
import { notificationFilters } from "@/lib/constants/notification";
import { Button } from "@/app/components/ui/button";
import { useNotificationParams } from "../../lib/hooks/useNotificationParams";
import { useUnreadCounts } from "../../lib/hooks/useUnreadCounts";
import { useMarkAllAsRead } from "../../lib/hooks/useMarkAllAsRead";
import { useNotifications } from "../../lib/hooks/useNotifications";
import { LoadingState } from "../LoadingState";
import { ErrorState } from "../ErrorState";
import { EmptyState } from "../EmptyState";

export function NotificationsContent() {
  const { expandedNotificationId, initialFilter, notificationIdFromParams } = useNotificationParams();
  const [activeFilter, setActiveFilter] = useState<NotificationType>(initialFilter);
  
  const { unreadCounts, refetchUnreadCounts } = useUnreadCounts();
  const { markingAllAsRead, markAllAsRead } = useMarkAllAsRead();
  const { 
    notifications, 
    loading, 
    error, 
    currentPage, 
    totalPages, 
    setCurrentPage, 
    refetch,
    markAsRead 
  } = useNotifications(activeFilter);

  // Handle initial filter from URL params
  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  const handleNotificationClick = useCallback(async (id: string) => {
    const success = await markAsRead(id);
    if (success) {
      refetchUnreadCounts();
    }
  }, [markAsRead, refetchUnreadCounts]);

  // Handle notification click from URL params
  useEffect(() => {
    if (notificationIdFromParams) {
      handleNotificationClick(notificationIdFromParams);
    }
  }, [notificationIdFromParams, handleNotificationClick]);

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      // Update all notifications to read state
      refetch();
      refetchUnreadCounts();
    }
  };

  return (
    <div className="space-y-6">
      {unreadCounts.all > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-[var(--text-secondary)]">
            {unreadCounts.all} thông báo chưa đọc
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAllAsRead}
            className="gap-2"
          >
            {markingAllAsRead ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCheck className="h-4 w-4" />
                Đánh dấu tất cả đã đọc
              </>
            )}
          </Button>
        </div>
      )}

      <Tabs
        items={notificationFilters.map(filter => ({
          key: filter.key,
          label: filter.label,
          badge: unreadCounts[filter.key] > 0 ? unreadCounts[filter.key] : undefined,
        }))}
        activeKey={activeFilter}
        onChange={setActiveFilter}
        disabled={loading}
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : notifications.length === 0 ? (
        <EmptyState activeFilter={activeFilter} />
      ) : (
        <>
          <div className="space-y-4">
            {notifications.map((notification: NotificationApiItem) => (
              <NotificationCard 
                key={notification.scheduleId} 
                notification={notification}
                onNotificationClick={handleNotificationClick}
                initialExpanded={notification.scheduleId === expandedNotificationId}
              />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
              >
                Trang trước
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                    className="min-w-[40px]"
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
