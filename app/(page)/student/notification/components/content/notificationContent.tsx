"use client"

import { BellOff, Loader2, CheckCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { NotificationCard } from "../notification-card/notificationCard"
import { NotificationType, NotificationApiItem } from "../../libs/type/notificationType"
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

  // Fetch notifications from API
  const fetchNotifications = async (filterType?: NotificationType, page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const params: any = {
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
      console.error("Error fetching notifications:", err)
      setError("Đã xảy ra lỗi khi tải thông báo")
    } finally {
      setLoading(false)
    }
  }

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
      }
    } catch (err) {
      console.error("Error marking notification as read:", err)
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
      }
    } catch (err) {
      console.error("Error marking all as read:", err)
    } finally {
      setMarkingAllAsRead(false)
    }
  }

  // Calculate filter counts - CHỈ đếm thông báo chưa đọc
  const filterCounts = {
    all: notifications.filter((n) => !n.isRead).length,
    important: notifications.filter((n) => n.notificationType === "important" && !n.isRead).length,
    tuition: notifications.filter((n) => n.notificationType === "tuition" && !n.isRead).length,
    event: notifications.filter((n) => n.notificationType === "event" && !n.isRead).length,
    schedule: notifications.filter((n) => n.notificationType === "schedule" && !n.isRead).length,
  }

  const filters: { key: NotificationType; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "important", label: "Quan trọng" },
    { key: "tuition", label: "Học phí" },
    { key: "event", label: "Sự kiện" },
    { key: "schedule", label: "Lịch học" },
  ]

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-6">
      {/* Header with Mark All as Read button */}
      {unreadCount > 0 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-[var(--text-secondary)]">
            {unreadCount} thông báo chưa đọc
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
      <div className="overflow-hidden">
        <div className="flex w-full border border-[var(--border)] rounded-lg bg-[var(--muted)] relative">
          {/* Active tab background slider */}
          <div 
            className="absolute top-0 bottom-0 bg-[var(--primary)] rounded-lg shadow-lg transition-all duration-300 ease-in-out z-0"
            style={{
              width: `${100 / filters.length}%`,
              left: `${filters.findIndex(f => f.key === activeFilter) * (100 / filters.length)}%`,
              transform: 'translateX(0)'
            }}
          />
          
          {filters.map((filter, index) => {
            const isActive = activeFilter === filter.key
            const unreadCount = filterCounts[filter.key]
            const hasUnread = unreadCount > 0

            return (
              <div key={filter.key} className="flex-1 relative z-10">
                <button
                  onClick={() => setActiveFilter(filter.key)}
                  disabled={loading}
                  className={`w-full cursor-pointer px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 relative ${
                    isActive
                      ? "text-[var(--primary-foreground)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="relative z-100">{filter.label}</span>
                  {/* Chỉ hiển thị badge khi có thông báo chưa đọc */}
                  {hasUnread && (
                    <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                      isActive 
                        ? "bg-[var(--badge-active-bg)] text-[var(--badge-active-text)] scale-110 shadow-sm" 
                        : "bg-[var(--badge-bg)] text-[var(--badge-text)] hover:scale-105 hover:shadow-sm"
                    }`}>
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                {/* Divider - chỉ hiển thị khi tab không được chọn và không phải tab cuối */}
                {!isActive && index < filters.length - 1 && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-6 bg-[var(--border)] transition-opacity duration-300"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>

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
