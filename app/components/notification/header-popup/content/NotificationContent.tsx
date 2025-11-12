"use client"

import { BellOff, Bell, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { NotificationCard } from "@/app/components/notification/header-popup/notification-card/NotificationCard"
import { notificationApi } from "@/lib/api/notification"
import { NotificationApiItem } from "@/lib/types/notification"
import { useAuthStore } from "@/lib/store/authStore"

export function NotificationPopup() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<NotificationApiItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuthStore()
  const userRole = user?.role
  const router = useRouter()

  const fetchUnreadCount = useCallback(async () => {
    if (!userRole) return
    try {
      const response = await notificationApi.getUnreadCount(userRole)
      if (response.isSuccess) {
        setUnreadCount(response.data.unreadCount)
      }
    } catch (err: unknown) {
      console.error('Error fetching unread count:', err);
    }
  }, [userRole])

  const fetchRecentNotifications = useCallback(async () => {
    if (!userRole) return
    try {
      setLoading(true)
      const response = await notificationApi.getNotifications({ PageSize: 10, Role: userRole })
      if (response.isSuccess) {
        setNotifications(response.data.notifications.data)
      }
    } catch (err: unknown) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false)
    }
  }, [userRole])

  useEffect(() => {
    if (userRole) {
      void fetchUnreadCount()
      const interval = setInterval(() => {
        void fetchUnreadCount()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [userRole, fetchUnreadCount])

  // Listen to global notification updates to refresh the unread badge immediately
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleUpdated: EventListener = () => {
      void fetchUnreadCount()
      // Optionally refresh the list if popover is open
      if (isOpen) void fetchRecentNotifications()
    }
    window.addEventListener('notifications:updated', handleUpdated)
    return () => window.removeEventListener('notifications:updated', handleUpdated)
  }, [isOpen, fetchRecentNotifications, fetchUnreadCount])

  useEffect(() => {
    if (isOpen && userRole) {
      void fetchRecentNotifications()
    }
  }, [isOpen, userRole, fetchRecentNotifications])

  const getNotificationLink = (readStatus?: string) => {
    if (!user) return "/login"
    const basePath = user.role === "Student" 
      ? "/student/notification" 
      : user.role === "Instructor" 
      ? "/instructor/notification" 
      : "/admin/notification"
    return readStatus ? `${basePath}?readStatus=${readStatus}` : basePath
  }

  const handleUnreadNavigate = () => {
    router.push(getNotificationLink("unread"))
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative border border-gray-300"
          type="button"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1.5 -right-1.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full border border-white bg-red-500 px-0.5 text-[9px] font-semibold text-white"
              title={`${unreadCount} thông báo chưa đọc`}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
        <div className="flex flex-col max-h-[480px]">
          {/* Header - Fixed */}
          <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Thông báo</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleUnreadNavigate}
                  className="text-xs font-medium text-blue-600 underline-offset-2 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  {unreadCount} chưa đọc
                </button>
              )}
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Loader2 className="h-10 w-10 text-blue-500 mb-3 animate-spin" />
                <p className="text-sm text-gray-500">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <BellOff className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-500 mb-1">Không có thông báo</p>
                <p className="text-xs text-gray-400">Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              <div className="p-3">
                <NotificationCard notifications={notifications} onClose={() => setIsOpen(false)} />
              </div>
            )}
          </div>

          {/* Footer - Fixed */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-white sticky bottom-0">
              <Link href={getNotificationLink()} onClick={() => setIsOpen(false)}>
                <Button
                  variant="outline"
                  className="w-full text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  Xem tất cả
                </Button>
              </Link>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
