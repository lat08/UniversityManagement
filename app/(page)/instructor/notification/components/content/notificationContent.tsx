"use client"

import { BellOff, Loader2, CheckCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { NotificationCard } from "@/app/components/notification/NotificationCard"
import { NotificationType, NotificationApiItem, NotificationQueryParams } from "@/lib/types/notification"
import { notificationApi } from "@/lib/api/notification"
import { notificationFilters } from "@/lib/constants/notification"
import { Button } from "@/app/components/ui/button"
import { Pagination } from "@/app/components/ui/pagination"

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
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10
  const [unreadCounts, setUnreadCounts] = useState({
    all: 0,
    event: 0,
    tuition: 0,
    schedule: 0,
    important: 0
  })

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
      // Error handled silently
    }
  }

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
        setTotalCount(response.data.notifications.totalCount)
      } else {
        setError(response.resultMessage || "Không thể tải thông báo")
      }
    } catch {
      setError("Đã xảy ra lỗi khi tải thông báo")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnreadCounts()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
    fetchNotifications(activeFilter, 1)
  }, [activeFilter])

  useEffect(() => {
    if (currentPage > 1) {
      fetchNotifications(activeFilter, currentPage)
    }
  }, [currentPage])

  useEffect(() => {
    if (typeParam && (typeParam === 'event' || typeParam === 'tuition' || typeParam === 'schedule' || typeParam === 'important')) {
      setActiveFilter(typeParam as NotificationType)
    }
    if (idParam) {
      setExpandedNotificationId(idParam)
      handleNotificationClick(idParam)
    }
  }, [typeParam, idParam])

  const handleNotificationClick = async (id: string) => {
    try {
      const response = await notificationApi.markAsRead(id)
      
      if (response.isSuccess) {
        setNotifications(prev => 
          prev.map(n => n.scheduleId === id ? { ...n, isRead: true } : n)
        )
        fetchUnreadCounts()
      }
    } catch (err) {
      // Error handled silently
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllAsRead(true)
      const response = await notificationApi.markAllAsRead()
      
      if (response.isSuccess) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        fetchUnreadCounts()
      }
    } catch (err) {
      // Error handled silently
    } finally {
      setMarkingAllAsRead(false)
    }
  }

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

      <div className="overflow-hidden">
        <div className="flex w-full border border-[var(--border)] rounded-lg bg-[var(--muted)] relative">
          <div 
            className="absolute top-0 bottom-0 bg-[var(--primary)] rounded-lg shadow-lg transition-all duration-300 ease-in-out z-0"
            style={{
              width: `${100 / notificationFilters.length}%`,
              left: `${notificationFilters.findIndex(f => f.key === activeFilter) * (100 / notificationFilters.length)}%`,
              transform: 'translateX(0)'
            }}
          />
          
          {notificationFilters.map((filter, index) => {
            const isActive = activeFilter === filter.key
            const unreadCount = unreadCounts[filter.key]
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
                {!isActive && index < notificationFilters.length - 1 && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-6 bg-[var(--border)] transition-opacity duration-300"></div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-16 w-16 text-[var(--primary)] mb-4 animate-spin" />
          <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">Đang tải thông báo...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BellOff className="h-16 w-16 text-[var(--error)] mb-4" />
          <p className="text-lg font-medium text-[var(--error)] mb-2">Lỗi tải thông báo</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">{error}</p>
          <Button onClick={() => fetchNotifications(activeFilter)} variant="outline">
            Thử lại
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BellOff className="h-16 w-16 text-[var(--muted-foreground)] mb-4" />
          <p className="text-lg font-medium text-[var(--text-secondary)] mb-2">Không có thông báo</p>
          <p className="text-sm text-[var(--text-muted)]">
            {activeFilter === "all" ? "Bạn chưa có thông báo nào" : "Không có thông báo trong danh mục này"}
          </p>
        </div>
      ) : (
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
  )
}
