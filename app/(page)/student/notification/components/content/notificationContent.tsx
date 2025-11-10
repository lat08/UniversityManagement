"use client";

import { Loader2, CheckCheck } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Tabs } from "@/app/components/ui/tabs";
import { NotificationCard } from "@/app/components/notification/NotificationCard";
import { NotificationType, NotificationApiItem } from "@/lib/types/notification";
import { notificationFilters } from "@/lib/constants/notification";
import { Button } from "@/app/components/ui/button";
import { Pagination } from "@/app/components/ui/pagination";
import { SearchInput } from "@/app/components/ui/search-input";
import { useNotificationParams } from "../../lib/hooks/useNotificationParams";
import { useUnreadCounts } from "../../lib/hooks/useUnreadCounts";
import { useMarkAllAsRead } from "../../lib/hooks/useMarkAllAsRead";
import { useNotifications } from "../../lib/hooks/useNotifications";
import { LoadingState } from "../LoadingState";
import { ErrorState } from "../ErrorState";
import { EmptyState } from "../EmptyState";

interface NotificationsContentProps {
  role?: string;
}

export function NotificationsContent({ role = "Student" }: NotificationsContentProps) {
  const { expandedNotificationId, initialFilter, notificationIdFromParams } = useNotificationParams();
  const [activeFilter, setActiveFilter] = useState<NotificationType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  const { unreadCounts, refetchUnreadCounts } = useUnreadCounts(role);
  const { markingAllAsRead, markAllAsRead } = useMarkAllAsRead(role);
  const { 
    notifications, 
    loading, 
    error, 
    currentPage, 
    totalPages,
    totalCount,
    pageSize,
    setCurrentPage, 
    refetch,
    markAsRead 
  } = useNotifications(activeFilter, { role, searchTerm: debouncedSearchTerm });

  // Handle initial filter from URL params
  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <SearchInput
            value={searchQuery}
            placeholder="Tìm kiếm thông báo..."
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {unreadCounts.all > 0 && (
          <div className="flex items-center gap-3">
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
      </div>

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
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
