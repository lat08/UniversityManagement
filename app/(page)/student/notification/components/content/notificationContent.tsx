"use client"

import { BellOff } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/app/components/ui/badge"
import { NotificationCard } from "../notification-card/notificationCard"
import { mockNotifications, notificationTypeConfig  } from "../../libs/constants/notificationConstants"
import { NotificationType } from "../../libs/type/notificationType"

export function NotificationsContent() {
  const [activeFilter, setActiveFilter] = useState<NotificationType>("all")

  const filterCounts = {
    all: mockNotifications.length,
    important: mockNotifications.filter((n) => n.type === "important").length,
    exam: mockNotifications.filter((n) => n.type === "exam").length,
    event: mockNotifications.filter((n) => n.type === "event").length,
    general: mockNotifications.filter((n) => n.type === "general").length,
  }

  const filteredNotifications =
    activeFilter === "all"
      ? mockNotifications
      : mockNotifications.filter((n) => n.type === activeFilter)

  const filters: { key: NotificationType; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "important", label: "Quan trọng" },
    { key: "exam", label: "Kỳ thi" },
    { key: "event", label: "Sự kiện" },
    { key: "general", label: "Thông tin chung" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Thông báo</h1>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 ">
          {filters.map((filter) => {
            const typeConfig = notificationTypeConfig[filter.key as keyof typeof notificationTypeConfig]
            const isActive = activeFilter === filter.key

            // các nút còn lại theo màu riêng
            return (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors  ${
                  isActive
                    ? typeConfig.className.replace("hover:", "") + " font-semibold"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-black-400"
                }`}
              >
                {filter.label}
                <Badge
                  variant="secondary"
                  className={`${
                    isActive
                      ? "bg-white text-current font-semibold"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {filterCounts[filter.key]}
                </Badge>
              </button>
            )
          })}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BellOff className="h-16 w-16 text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500 mb-2">Không có thông báo</p>
          <p className="text-sm text-gray-400">
            {activeFilter === "all" ? "Bạn chưa có thông báo nào" : "Không có thông báo trong danh mục này"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  )
}
