"use client";

import { useState, useEffect, useCallback } from "react";
import { NotificationType } from "@/lib/types/notification";
import { useNotifications } from "../../lib/hooks/useNotifications";
import { useUnreadCounts } from "../../lib/hooks/useUnreadCounts";
import { useMarkAllAsRead } from "../../lib/hooks/useMarkAllAsRead";
import { useNotificationParams } from "../../lib/hooks/useNotificationParams";
import { UnreadCountHeader } from "../UnreadCountHeader";
import { NotificationFiltersTabs } from "../NotificationFiltersTabs";
import { LoadingState } from "../LoadingState";
import { ErrorState } from "../ErrorState";
import { EmptyState } from "../EmptyState";
import { NotificationList } from "../NotificationList";
import { Pagination } from "../Pagination";

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
      <UnreadCountHeader
        unreadCount={unreadCounts.all}
        markingAllAsRead={markingAllAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />

      <NotificationFiltersTabs
        activeFilter={activeFilter}
        unreadCounts={unreadCounts}
        loading={loading}
        onFilterChange={setActiveFilter}
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : notifications.length === 0 ? (
        <EmptyState activeFilter={activeFilter} />
      ) : (
        <>
          <NotificationList
            notifications={notifications}
            expandedNotificationId={expandedNotificationId}
            onNotificationClick={handleNotificationClick}
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            loading={loading}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
