"use client"

import { BellOff, Bell } from "lucide-react"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover"
import { mockNotifications } from "@/public/data/notifications"
import { NotificationCard } from "@/app/components/notification/header-popup/notification-card/page"



export function NotificationPopup() {
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Thông báo</h3>
          {mockNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BellOff className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500 mb-1">Không có thông báo</p>
              <p className="text-xs text-gray-400">Bạn chưa có thông báo nào</p>
            </div>
          ) : (
            <>
              <NotificationCard/>
              <Link href="/notification">
                <Button
                  variant="outline"
                  className="w-full mt-4 text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  Xem tất cả
                </Button>
              </Link>
            </>
          )}
        </div>
        
      </PopoverContent>
    </Popover>
  )
}
