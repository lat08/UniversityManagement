"use client"

import { BellOff, Loader2, CheckCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs } from "@/app/components/ui/tabs"
import { NotificationCard } from "../notification-card/notificationCard"
import { NotificationType, NotificationApiItem, NotificationQueryParams } from "../../libs/type/notificationType"
import { notificationApi } from "../../libs/api/notificationApi"
import { Button } from "@/app/components/ui/button"

export function NotificationsContent() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const idParam = searchParams.get('id')
  
  const [activeFilter, setActiveFilter] = useState<NotificationType>("all")
  const [notifications, setNotifications] = useState<NotificationApiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)
  const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10
  const [unreadCounts, setUnreadCounts] = useState({
    all: 0,
    event: 0,
    tuition: 0,
    schedule: 0,
    important: 0
  })

  // Fetch unread counts from API
  const fetchUnreadCounts = async () => {
    try {
      const response = await notificationApi.getUnreadCountByCategory()
      if (response.isSuccess) {
        setUnreadCounts({
          all: response.data.countByCategory.total,
          event: response.data.countByCategory.event,
          tuition: response.data.countByCategory.tuition,
          schedule: response.data.countByCategory.schedule,
          important: response.data.countByCategory.important
        })
      }
    } catch (err) {
    }
  }

  // Fetch notifications from API
  const fetchNotifications = async (filterType?: NotificationType, page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params: NotificationQueryParams = {
        PageIndex: page,
        PageSize: pageSize
      }
      
      if (filterType && filterType !== "all") {
        params.NotificationType = filterType
      }

      const response = await notificationApi.getNotifications(params)
      
      if (response.isSuccess) {
        setNotifications(response.data.notifications.data)
        setTotalPages(response.data.notifications.totalPages)
        setCurrentPage(response.data.notifications.page)
      } else {
        setError(response.resultMessage || "Không thể tải thông báo")
      }
    } catch (err) {
      setError("Đã xảy ra lỗi khi tải thông báo")
    } finally {
      setLoading(false)
    }
  }

  // Load unread counts on mount
  useEffect(() => {
    fetchUnreadCounts()
  }, [])

  // Load notifications on mount and when filter changes
  useEffect(() => {
    setCurrentPage(1) // Reset page when filter changes
    fetchNotifications(activeFilter, 1)
  }, [activeFilter])

  // Load notifications when page changes
  useEffect(() => {
    if (currentPage > 1) {
      fetchNotifications(activeFilter, currentPage)
    }
  }, [currentPage])

  // Handle URL params on mount
  useEffect(() => {
    if (typeParam && (typeParam === 'event' || typeParam === 'tuition' || typeParam === 'schedule' || typeParam === 'important')) {
      setActiveFilter(typeParam as NotificationType)
    }
    if (idParam) {
      setExpandedNotificationId(idParam)
      // Mark as read when opened via URL
      handleNotificationClick(idParam)
    }
  }, [typeParam, idParam])

  // Handle notification click (mark as read)
  const handleNotificationClick = async (id: string) => {
    try {
      const response = await notificationApi.markAsRead(id)
      
      if (response.isSuccess) {
        // Update the notification in the list to mark it as read
        setNotifications(prev => 
          prev.map(n => n.scheduleId === id ? { ...n, isRead: true } : n)
        )
        // Refresh unread counts
        fetchUnreadCounts()
      }
    } catch (err) {
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true)
      const response = await notificationApi.markAllAsRead()
      
      if (response.isSuccess) {
        // Update all notifications to mark as read
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        // Refresh unread counts
        fetchUnreadCounts()
      }
    } catch (err) {
    } finally {
      setMarkingAllAsRead(false)
    }
  }

  const filters: { key: NotificationType; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "important", label: "Quan trọng" },
    { key: "tuition", label: "Học phí" },
    { key: "event", label: "Sự kiện" },
    { key: "schedule", label: "Lịch học" },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Mark All as Read button */}
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

      {/* Filter tabs */}
      <Tabs
        items={filters.map(filter => ({
          key: filter.key,
          label: filter.label,
          badge: unreadCounts[filter.key] > 0 ? unreadCounts[filter.key] : undefined,
        }))}
        activeKey={activeFilter}
        onChange={setActiveFilter}
        disabled={loading}
      />

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-16 w-16 text-[var(--primary)] mb-4 animate-spin" />
          <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">Đang tải thông báo...</p>
        </div>
      ) : error ? (
        /* Error state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BellOff className="h-16 w-16 text-[var(--error)] mb-4" />
          <p className="text-lg font-medium text-[var(--error)] mb-2">Lỗi tải thông báo</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">{error}</p>
          <Button onClick={() => fetchNotifications(activeFilter)} variant="outline">
            Thử lại
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BellOff className="h-16 w-16 text-[var(--muted-foreground)] mb-4" />
          <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">Không có thông báo</p>
          <p className="text-sm text-[var(--text-muted)]">
            {activeFilter === "all" ? "Bạn chưa có thông báo nào" : "Không có thông báo trong danh mục này"}
          </p>
        </div>
      ) : (
        /* Notifications list */
        <>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <NotificationCard 
                key={notification.scheduleId} 
                notification={notification}
                onNotificationClick={handleNotificationClick}
                initialExpanded={notification.scheduleId === expandedNotificationId}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Trang sau
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
