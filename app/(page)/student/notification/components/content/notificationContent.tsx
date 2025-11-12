"use client";

import { CheckCheck, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { NotificationCard } from "@/app/components/notification/NotificationCard";
import { Button } from "@/app/components/ui/button";
import { Pagination } from "@/app/components/ui/pagination";
import { SearchInput } from "@/app/components/ui/search-input";
import { Dropdown } from "@/app/components/ui/dropdown";
import { notificationReadStatusFilters } from "@/lib/constants/notification";
import { NotificationApiItem, NotificationReadStatus, NotificationType } from "@/lib/types/notification";
import { measurePerformance } from "@/lib/utils/performance";
import { notificationApi } from "@/lib/api/notification";

import {
  useNotificationMutations,
  useNotificationsQuery,
  useUnreadCounts,
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/lib/features/notifications";

import { useNotificationParams } from "../../lib/hooks/useNotificationParams";
import { NotificationFiltersTabs } from "../NotificationFiltersTabs";

interface NotificationsContentProps {
  role?: string;
}

export function NotificationsContent({ role = "Student" }: NotificationsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { expandedNotificationId, initialFilter, initialReadStatusFilter, notificationIdFromParams } = useNotificationParams();
  
  // Stable reference cho URL params để tránh re-render
  const hasPageParam = useMemo(() => searchParams.get('page') !== null, [searchParams]);
  const pageFromUrl = useMemo(() => parseInt(searchParams.get('page') || '1', 10), [searchParams]);
  
  const [activeFilter, setActiveFilter] = useState<NotificationType>(initialFilter);
  const [readStatusFilter, setReadStatusFilter] = useState<NotificationReadStatus>(initialReadStatusFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const [isLoadingTargetPage, setIsLoadingTargetPage] = useState(false);

  // Performance tracking
  useEffect(() => {
    measurePerformance('notification-page-mount');
    return () => {
      measurePerformance('notification-page-unmount', 'notification-page-mount');
    };
  }, []);

  const readStatusOptions = useMemo(
    () =>
      notificationReadStatusFilters.map((filter) => ({
        value: filter.key,
        label: filter.label,
      })),
    [],
  );

  const { unreadCounts, isLoading: isLoadingCounts, isFetching: isFetchingCounts, refetchUnreadCounts } = useUnreadCounts(role);
  const { 
    markAsRead,
    markAllAsRead, 
    isMarkingAllAsRead,
  } = useNotificationMutations({ role });

  const { 
    notifications, 
    isLoading,
    isError,
    error, 
    totalPages,
    totalCount,
    pageSize,
    refetch,
  } = useNotificationsQuery({
    notificationType: activeFilter,
    readStatus: readStatusFilter,
    role,
    searchTerm: debouncedSearchTerm,
    page: currentPage,
  });

  // Sync currentPage với URL khi user thay đổi page manually
  useEffect(() => {
    setCurrentPage(pageFromUrl);
  }, [pageFromUrl]);

  // Reset page to 1 khi filters thay đổi (nhưng không reset nếu đang có notificationId trong URL)
  useEffect(() => {
    // Nếu URL có notification ID, không reset page vì đang navigate đến notification cụ thể
    if (notificationIdFromParams) {
      return;
    }
    
    setCurrentPage(1);
  }, [activeFilter, readStatusFilter, debouncedSearchTerm, notificationIdFromParams]);

  // Handle initial filter from URL params
  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  useEffect(() => {
    setReadStatusFilter(initialReadStatusFilter);
  }, [initialReadStatusFilter]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleNotificationClick = useCallback(async (id: string) => {
    const notification = notifications.find(n => n.scheduleId === id);
    if (!notification || notification.isRead) {
      return;
    }
    
    try {
      await markAsRead(id);
      void refetchUnreadCounts();
    } catch {
      // Error handled by mutation
    }
  }, [markAsRead, refetchUnreadCounts, notifications]);

  // Fetch target notification page number và redirect đến đúng trang
  useEffect(() => {
    if (!notificationIdFromParams) return;
    
    // Nếu đã có page param trong URL thì không fetch nữa
    if (hasPageParam) {
      return;
    }

    let isCancelled = false;

    const fetchAndRedirectToPage = async () => {
      setIsLoadingTargetPage(true);
      try {
        // Build filter params giống như query hiện tại
        const pageParams = {
          NotificationType: initialFilter !== 'all' ? initialFilter : undefined,
          IsRead: initialReadStatusFilter !== 'all' ? (initialReadStatusFilter === 'read') : undefined,
          PageSize: pageSize,
          Role: role,
        };

        // Gọi API để lấy page number
        const pageResponse = await notificationApi.getPageNumber(notificationIdFromParams, pageParams);

        if (isCancelled) return;

        if (pageResponse.isSuccess && pageResponse.data?.pageNumber) {
          const targetPage = pageResponse.data.pageNumber;
          
          // Build URL với page param
          const params = new URLSearchParams(searchParams.toString());
          params.set('page', targetPage.toString());
          
          // Redirect đến URL mới với page number
          router.replace(`?${params.toString()}`);
        }
      } catch {
        // Error handled silently
      } finally {
        if (!isCancelled) {
          setIsLoadingTargetPage(false);
        }
      }
    };

    void fetchAndRedirectToPage();

    return () => {
      isCancelled = true;
    };
    // ⚠️ Chỉ phụ thuộc vào notificationId và hasPageParam để tránh infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationIdFromParams, hasPageParam, initialFilter, initialReadStatusFilter, pageSize, role]);

  // Mark notification as read khi tìm thấy trong list
  useEffect(() => {
    if (!notificationIdFromParams || notifications.length === 0) return;

    const notification = notifications.find(n => n.scheduleId === notificationIdFromParams);
    if (notification && !notification.isRead) {
      void handleNotificationClick(notification.scheduleId);
    }
  }, [notificationIdFromParams, notifications, handleNotificationClick]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      void refetchUnreadCounts();
    } catch {
      // Error handled by mutation
    }
  };

  // Handle page change và update URL
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Update URL với page number
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-sm">
            <SearchInput
              value={searchQuery}
              placeholder="Tìm kiếm thông báo..."
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <Dropdown
            options={readStatusOptions}
            value={readStatusFilter}
            onChange={(value) => setReadStatusFilter(value as NotificationReadStatus)}
            disabled={isLoading}
            placeholder="Trạng thái"
            className="w-full sm:w-48"
            buttonClassName="h-10"
          />
        </div>

        {unreadCounts.all > 0 && (
          <div className="flex items-center gap-3 whitespace-nowrap">
            <div className="text-sm text-[var(--text-secondary)] whitespace-nowrap">
              {unreadCounts.all} thông báo chưa đọc
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllAsRead}
              className="gap-2 whitespace-nowrap"
            >
              {isMarkingAllAsRead ? (
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

      <NotificationFiltersTabs
        activeFilter={activeFilter}
        unreadCounts={unreadCounts}
        loading={isLoadingCounts}
        isFetching={isFetchingCounts}
        onFilterChange={setActiveFilter}
      />

      {isLoading && !notificationIdFromParams ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState error={error ?? "Unknown error"} onRetry={refetch} />
      ) : (
        <>
          <div className="space-y-4">
            {isLoading || isLoadingTargetPage ? (
              <LoadingState />
            ) : !Array.isArray(notifications) || notifications.length === 0 ? (
              <EmptyState activeFilter={activeFilter} />
            ) : (
              notifications.map((notification: NotificationApiItem) => {
                const shouldExpand = notification.scheduleId === expandedNotificationId || 
                                     notification.scheduleId === notificationIdFromParams
                return (
                  <NotificationCard 
                    key={notification.scheduleId} 
                    notification={notification}
                    onNotificationClick={handleNotificationClick}
                    initialExpanded={shouldExpand}
                  />
                )
              })
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
