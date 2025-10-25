"use client"

import { BellOff, Bell, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { NotificationCard } from "@/app/components/notification/header-popup/notification-card/NotificationCard"
import { notificationApi } from "@/app/(page)/student/notification/libs/api/notificationApi"
import { NotificationApiItem } from "@/app/(page)/student/notification/libs/type/notificationType"
import { useAuthStore } from "@/lib/store/authStore"

export function NotificationPopup() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<NotificationApiItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuthStore()

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount()
      if (response.isSuccess) {
        setUnreadCount(response.data.unreadCount)
      }
    } catch (err) {
      console.error("Error fetching unread count:", err)
    }
  }

  // Fetch recent notifications when popup opens (max 10)
  const fetchRecentNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationApi.getNotifications({ PageSize: 10 })
      if (response.isSuccess) {
        setNotifications(response.data.data)
      }
    } catch (err) {
      console.error("Error fetching notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  // Poll unread count every 30 seconds when user is logged in
  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000) // 30 seconds
      return () => clearInterval(interval)
    }
  }, [user])

  // Fetch notifications when popup opens
  useEffect(() => {
    if (isOpen && user) {
      fetchRecentNotifications()
    }
  }, [isOpen, user])

  // Determine notification link based on role
  const getNotificationLink = () => {
    if (!user) return "/login"
    if (user.role === "Student") return "/student/notification"
    if (user.role === "Instructor") return "/instructor/notification"
    return "/admin/notification"
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative border border-gray-300">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-[1px] right-[1px] flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
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
                <span className="text-xs text-gray-500">
                  {unreadCount} chưa đọc
                </span>
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
